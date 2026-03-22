"""Playwright-based web scraper for VA job aggregation."""
import os
import re
import json
import asyncio
import hashlib
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from urllib.parse import urljoin, urlparse

from playwright.async_api import async_playwright, Page, Browser, BrowserContext
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from app.models.scraped_job import ScrapedJob, ScrapedJobSource, AutoApplyStatus, JobScrapeLog


@dataclass
class ScrapedJobData:
    """Structured job data from scraping."""
    source: str
    external_id: str
    title: str
    description: str
    company: str
    location: str
    job_type: str
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    currency: str = "USD"
    skills_required: List[str] = field(default_factory=list)
    experience_level: str = "any"
    url: str = ""
    posted_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    remote_ok: bool = True
    timezone: Optional[str] = None
    language_requirements: List[str] = field(default_factory=list)
    is_active: bool = True
    raw_data: Dict = field(default_factory=dict)


class PlaywrightScraperService:
    """Robust job scraper using Playwright for JavaScript-heavy sites."""

    def __init__(self):
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.playwright = None
        self.rate_limits: Dict[str, datetime] = {}

    async def _init_browser(self, headless: bool = True):
        """Initialize Playwright browser."""
        if self.playwright is None:
            self.playwright = await async_playwright().start()

        if self.browser is None:
            self.browser = await self.playwright.chromium.launch(
                headless=headless,
                args=['--disable-blink-features=AutomationControlled']
            )

        if self.context is None:
            self.context = await self.browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                locale='en-US',
                timezone_id='America/New_York',
            )

            # Set extra headers to appear more human
            await self.context.set_extra_http_headers({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'DNT': '1',
            })

    async def _close_browser(self):
        """Clean up browser resources."""
        if self.context:
            await self.context.close()
            self.context = None
        if self.browser:
            await self.browser.close()
            self.browser = None
        if self.playwright:
            await self.playwright.stop()
            self.playwright = None

    async def _fetch_page(self, url: str, wait_for: str = None, timeout: int = 30000) -> Optional[str]:
        """Fetch page content using Playwright."""
        await self._init_browser()

        page = await self.context.new_page()
        try:
            # Add random delay to appear more human
            await asyncio.sleep(1 + (hash(url) % 3))

            response = await page.goto(url, wait_until='networkidle', timeout=timeout)

            if response.status == 200:
                # Wait for specific element if provided
                if wait_for:
                    try:
                        await page.wait_for_selector(wait_for, timeout=10000)
                    except:
                        pass  # Continue even if element not found

                # Scroll to load lazy content
                await self._scroll_page(page)

                content = await page.content()
                return content
            else:
                print(f"Error fetching {url}: HTTP {response.status}")
                return None
        except Exception as e:
            print(f"Exception fetching {url}: {e}")
            return None
        finally:
            await page.close()

    async def _scroll_page(self, page: Page, scroll_delay: int = 500):
        """Scroll page to load lazy content."""
        try:
            await page.evaluate('''async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 300;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;

                        if(totalHeight >= scrollHeight) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            }''')
            await asyncio.sleep(scroll_delay / 1000)
        except:
            pass

    async def scrape_upwork(self) -> List[ScrapedJobData]:
        """Scrape Upwork VA jobs using Playwright."""
        jobs = []
        search_urls = [
            "https://www.upwork.com/nx/jobs/search/?q=virtual+assistant",
            "https://www.upwork.com/nx/jobs/search/?q=executive+assistant",
            "https://www.upwork.com/nx/jobs/search/?q=administrative+assistant",
        ]

        for search_url in search_urls:
            print(f"Scraping Upwork: {search_url}")
            html = await self._fetch_page(search_url, wait_for='[data-test="JobTile"]')

            if not html:
                continue

            soup = BeautifulSoup(html, 'lxml')
            job_cards = soup.find_all('article', {'data-test': 'JobTile'})

            print(f"Found {len(job_cards)} job cards on Upwork")

            for card in job_cards[:20]:
                try:
                    job = self._parse_upwork_card(card)
                    if job:
                        jobs.append(job)
                except Exception as e:
                    print(f"Error parsing Upwork job: {e}")
                    continue

            await asyncio.sleep(3)  # Be respectful

        return jobs

    def _parse_upwork_card(self, card) -> Optional[ScrapedJobData]:
        """Parse individual Upwork job card."""
        try:
            title_elem = card.find('h2', {'data-test': 'job-title'})
            title = title_elem.get_text(strip=True) if title_elem else ""

            if not title:
                return None

            link_elem = card.find('a', href=True)
            url = urljoin('https://www.upwork.com', link_elem['href']) if link_elem else ""

            desc_elem = card.find('span', {'data-test': 'job-description-text'})
            description = desc_elem.get_text(strip=True) if desc_elem else ""

            # Extract budget
            budget_elem = card.find('span', {'data-test': 'budget'})
            budget_text = budget_elem.get_text(strip=True) if budget_elem else ""
            budget_min, budget_max = self._parse_budget(budget_text)

            # Extract client info
            client_elem = card.find('div', {'data-test': 'client-info'})
            company = "Upwork Client"
            if client_elem:
                name_elem = client_elem.find('span', {'data-test': 'client-name'})
                if name_elem:
                    company = name_elem.get_text(strip=True)

            # Posted time
            posted_elem = card.find('span', {'data-test': 'posted-on'})
            posted_at = self._parse_relative_time(posted_elem.get_text(strip=True) if posted_elem else "")

            skills = self._extract_skills(description)

            return ScrapedJobData(
                source='upwork',
                external_id=self._generate_external_id(url),
                title=title,
                description=description,
                company=company,
                location="Remote",
                job_type="contract",
                budget_min=budget_min,
                budget_max=budget_max,
                currency="USD",
                skills_required=skills,
                experience_level=self._extract_experience_level(description),
                url=url,
                posted_at=posted_at,
                remote_ok=True,
                raw_data={'html': str(card)}
            )
        except Exception as e:
            print(f"Parse error: {e}")
            return None

    async def scrape_linkedin(self) -> List[ScrapedJobData]:
        """Scrape LinkedIn jobs using Playwright."""
        jobs = []
        search_urls = [
            "https://www.linkedin.com/jobs/search/?keywords=virtual%20assistant&f_WT=2",  # Remote
            "https://www.linkedin.com/jobs/search/?keywords=executive%20assistant&f_WT=2",
        ]

        for search_url in search_urls:
            print(f"Scraping LinkedIn: {search_url}")
            html = await self._fetch_page(search_url, wait_for='.base-search-card', timeout=60000)

            if not html:
                continue

            soup = BeautifulSoup(html, 'lxml')
            job_cards = soup.find_all('div', {'data-job-id': True})

            print(f"Found {len(job_cards)} job cards on LinkedIn")

            for card in job_cards[:20]:
                try:
                    job = self._parse_linkedin_card(card)
                    if job:
                        jobs.append(job)
                except Exception as e:
                    print(f"Error parsing LinkedIn job: {e}")
                    continue

            await asyncio.sleep(3)

        return jobs

    def _parse_linkedin_card(self, card) -> Optional[ScrapedJobData]:
        """Parse individual LinkedIn job card."""
        try:
            title_elem = card.find('h3', class_='base-search-card__title')
            title = title_elem.get_text(strip=True) if title_elem else ""

            if not title:
                return None

            company_elem = card.find('h4', class_='base-search-card__subtitle')
            company = company_elem.get_text(strip=True) if company_elem else ""

            link_elem = card.find('a', class_='base-card__full-link')
            url = link_elem['href'] if link_elem else ""

            location_elem = card.find('span', class_='job-search-card__location')
            location = location_elem.get_text(strip=True) if location_elem else "Remote"

            # Get full description if possible
            description = ""

            skills = self._extract_skills(f"{title} {description}")

            return ScrapedJobData(
                source='linkedin',
                external_id=self._generate_external_id(url),
                title=title,
                description=description or title,
                company=company,
                location=location,
                job_type="full_time",
                budget_min=None,
                budget_max=None,
                currency="USD",
                skills_required=skills,
                experience_level=self._extract_experience_level(title),
                url=url,
                posted_at=datetime.utcnow(),
                remote_ok="remote" in location.lower(),
                raw_data={'html': str(card)[:1000]}
            )
        except Exception as e:
            print(f"Parse error: {e}")
            return None

    async def scrape_indeed(self) -> List[ScrapedJobData]:
        """Scrape Indeed jobs using Playwright."""
        jobs = []
        search_urls = [
            "https://www.indeed.com/jobs?q=virtual+assistant&l=remote&remotejob=032b3046-06a5-11ea-8e8d-833344a56061",
            "https://www.indeed.com/jobs?q=executive+assistant&l=remote&remotejob=032b3046-06a5-11ea-8e8d-833344a56061",
        ]

        for search_url in search_urls:
            print(f"Scraping Indeed: {search_url}")
            html = await self._fetch_page(search_url, wait_for='[data-jk]', timeout=60000)

            if not html:
                continue

            soup = BeautifulSoup(html, 'lxml')
            job_cards = soup.find_all('div', {'data-jk': True})

            print(f"Found {len(job_cards)} job cards on Indeed")

            for card in job_cards[:20]:
                try:
                    job = self._parse_indeed_card(card)
                    if job:
                        jobs.append(job)
                except Exception as e:
                    print(f"Error parsing Indeed job: {e}")
                    continue

            await asyncio.sleep(3)

        return jobs

    def _parse_indeed_card(self, card) -> Optional[ScrapedJobData]:
        """Parse individual Indeed job card."""
        try:
            title_elem = card.find('h2', class_='jobTitle')
            title = title_elem.get_text(strip=True) if title_elem else ""

            if not title:
                return None

            company_elem = card.find('span', {'data-testid': 'company-name'})
            company = company_elem.get_text(strip=True) if company_elem else ""

            location_elem = card.find('div', {'data-testid': 'job-location'})
            location = location_elem.get_text(strip=True) if location_elem else "Remote"

            job_id = card.get('data-jk', '')
            url = f"https://www.indeed.com/viewjob?jk={job_id}"

            summary_elem = card.find('div', class_='job-snippet')
            description = summary_elem.get_text(strip=True) if summary_elem else ""

            salary_elem = card.find('div', {'data-testid': 'job-salary'})
            budget_text = salary_elem.get_text(strip=True) if salary_elem else ""
            budget_min, budget_max = self._parse_budget(budget_text)

            skills = self._extract_skills(description)

            return ScrapedJobData(
                source='indeed',
                external_id=job_id,
                title=title,
                description=description,
                company=company,
                location=location,
                job_type="full_time",
                budget_min=budget_min,
                budget_max=budget_max,
                currency="USD",
                skills_required=skills,
                experience_level=self._extract_experience_level(description),
                url=url,
                posted_at=datetime.utcnow(),
                remote_ok=True,
                auto_apply_supported=True,
                raw_data={'job_id': job_id}
            )
        except Exception as e:
            print(f"Parse error: {e}")
            return None

    async def scrape_we_work_remotely(self) -> List[ScrapedJobData]:
        """Scrape We Work Remotely jobs."""
        jobs = []
        url = "https://weworkremotely.com/remote-jobs/search?term=virtual+assistant"

        print(f"Scraping We Work Remotely")
        html = await self._fetch_page(url, wait_for='.feature')

        if html:
            soup = BeautifulSoup(html, 'lxml')
            listings = soup.find_all('li', class_='feature')

            print(f"Found {len(listings)} jobs on We Work Remotely")

            for listing in listings[:15]:
                try:
                    title_elem = listing.find('span', class_='title')
                    title = title_elem.get_text(strip=True) if title_elem else ""

                    if not title:
                        continue

                    company_elem = listing.find('span', class_='company')
                    company = company_elem.get_text(strip=True) if company_elem else ""

                    link_elem = listing.find('a', href=True)
                    job_url = urljoin('https://weworkremotely.com', link_elem['href']) if link_elem else ""

                    skills = self._extract_skills(title)

                    jobs.append(ScrapedJobData(
                        source='we_work_remotely',
                        external_id=self._generate_external_id(job_url),
                        title=title,
                        description=title,
                        company=company,
                        location="Remote",
                        job_type="full_time",
                        skills_required=skills,
                        url=job_url,
                        posted_at=datetime.utcnow(),
                        remote_ok=True,
                        raw_data={}
                    ))
                except Exception as e:
                    print(f"Error parsing WWR job: {e}")
                    continue

        return jobs

    async def scrape_remotive(self) -> List[ScrapedJobData]:
        """Scrape Remotive jobs."""
        jobs = []
        urls = [
            "https://remotive.com/remote-jobs/virtual-assistant",
            "https://remotive.com/remote-jobs/customer-support",
        ]

        for url in urls:
            print(f"Scraping Remotive: {url}")
            html = await self._fetch_page(url)

            if html:
                soup = BeautifulSoup(html, 'lxml')
                job_cards = soup.find_all('div', class_='job-card')

                print(f"Found {len(job_cards)} jobs on Remotive")

                for card in job_cards[:15]:
                    try:
                        title_elem = card.find('h3')
                        title = title_elem.get_text(strip=True) if title_elem else ""

                        if not title:
                            continue

                        company_elem = card.find('span', class_='company')
                        company = company_elem.get_text(strip=True) if company_elem else ""

                        link_elem = card.find('a', href=True)
                        job_url = link_elem['href'] if link_elem else ""

                        skills = self._extract_skills(title)

                        jobs.append(ScrapedJobData(
                            source='remotive',
                            external_id=self._generate_external_id(job_url),
                            title=title,
                            description=title,
                            company=company,
                            location="Remote",
                            job_type="full_time",
                            skills_required=skills,
                            url=job_url,
                            posted_at=datetime.utcnow(),
                            remote_ok=True,
                            raw_data={}
                        ))
                    except Exception as e:
                        print(f"Error parsing Remotive job: {e}")
                        continue

            await asyncio.sleep(2)

        return jobs

    async def scrape_all_sources(self) -> Dict[str, List[ScrapedJobData]]:
        """Scrape all configured sources."""
        await self._init_browser()

        results = {}

        try:
            print("\n=== Starting Scraping Run ===\n")

            results['upwork'] = await self.scrape_upwork()
            print(f"Upwork: {len(results['upwork'])} jobs")

            results['linkedin'] = await self.scrape_linkedin()
            print(f"LinkedIn: {len(results['linkedin'])} jobs")

            results['indeed'] = await self.scrape_indeed()
            print(f"Indeed: {len(results['indeed'])} jobs")

            results['we_work_remotely'] = await self.scrape_we_work_remotely()
            print(f"WWR: {len(results['we_work_remotely'])} jobs")

            results['remotive'] = await self.scrape_remotive()
            print(f"Remotive: {len(results['remotive'])} jobs")

            total = sum(len(jobs) for jobs in results.values())
            print(f"\n=== Total Jobs Scraped: {total} ===\n")

        finally:
            await self._close_browser()

        return results

    def save_scraped_jobs(self, db: Session, jobs: List[ScrapedJobData]) -> Dict[str, int]:
        """Save scraped jobs to database, avoiding duplicates."""
        stats = {'new': 0, 'updated': 0, 'duplicate': 0, 'error': 0}

        for job_data in jobs:
            try:
                # Check if job already exists
                existing = db.query(ScrapedJob).filter(
                    ScrapedJob.external_id == job_data.external_id,
                    ScrapedJob.source == job_data.source
                ).first()

                if existing:
                    # Update existing job
                    if job_data.is_active:
                        existing.title = job_data.title
                        existing.description = job_data.description
                        existing.company = job_data.company
                        existing.location = job_data.location
                        existing.is_active = True
                        existing.last_scraped_at = datetime.utcnow()
                        existing.budget_min = job_data.budget_min
                        existing.budget_max = job_data.budget_max
                        stats['updated'] += 1
                    else:
                        existing.is_active = False
                        stats['updated'] += 1
                else:
                    # Create new scraped job
                    scraped_job = ScrapedJob(
                        source=ScrapedJobSource(job_data.source),
                        external_id=job_data.external_id,
                        title=job_data.title,
                        description=job_data.description,
                        company=job_data.company,
                        location=job_data.location,
                        job_type=job_data.job_type,
                        budget_min=job_data.budget_min,
                        budget_max=job_data.budget_max,
                        currency=job_data.currency,
                        skills_required=job_data.skills_required,
                        experience_level=job_data.experience_level,
                        url=job_data.url,
                        posted_at=job_data.posted_at or datetime.utcnow(),
                        remote_ok=job_data.remote_ok,
                        timezone=job_data.timezone,
                        language_requirements=job_data.language_requirements,
                        is_active=True,
                        auto_apply_supported=job_data.source == 'indeed',
                        last_scraped_at=datetime.utcnow(),
                        raw_data=job_data.raw_data,
                    )
                    db.add(scraped_job)
                    stats['new'] += 1

                db.commit()

            except Exception as e:
                print(f"Error saving job: {e}")
                db.rollback()
                stats['error'] += 1

        return stats

    def log_scrape_run(self, db: Session, source: str, stats: Dict[str, int], error: str = None):
        """Log scraping run to database."""
        log = JobScrapeLog(
            source=ScrapedJobSource(source),
            status='failed' if error else 'success',
            jobs_found=stats.get('new', 0) + stats.get('updated', 0) + stats.get('duplicate', 0),
            jobs_new=stats.get('new', 0),
            jobs_updated=stats.get('updated', 0),
            jobs_duplicate=stats.get('duplicate', 0),
            jobs_failed=stats.get('error', 0),
            error_message=error,
            completed_at=datetime.utcnow(),
        )
        db.add(log)
        db.commit()

    # Helper methods

    def _generate_external_id(self, url: str) -> str:
        """Generate unique ID from URL."""
        return hashlib.md5(url.encode()).hexdigest()[:16]

    def _parse_budget(self, budget_text: str) -> tuple:
        """Extract min/max budget from text."""
        if not budget_text:
            return None, None

        # Hourly rate patterns
        hourly_pattern = r'\$?([\d,]+(?:\.\d{2})?)\s*(?:-\s*\$?([\d,]+(?:\.\d{2})?))?\s*/?\s*(?:hr|hour)'
        match = re.search(hourly_pattern, budget_text, re.IGNORECASE)
        if match:
            try:
                min_rate = float(match.group(1).replace(',', ''))
                max_rate = float(match.group(2).replace(',', '')) if match.group(2) else min_rate
                return min_rate, max_rate
            except:
                pass

        # Fixed budget patterns
        fixed_pattern = r'\$?([\d,]+(?:\.\d{2})?)'
        match = re.search(fixed_pattern, budget_text.replace(',', ''))
        if match:
            try:
                amount = float(match.group(1))
                return amount, amount
            except:
                pass

        return None, None

    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from job text."""
        if not text:
            return []

        text_lower = text.lower()

        skill_keywords = {
            'administrative': ['administrative', 'admin', 'data entry', 'scheduling'],
            'communication': ['email management', 'communication', 'correspondence', 'phone'],
            'social_media': ['social media', 'instagram', 'facebook', 'linkedin', 'twitter', 'content creation', 'marketing'],
            'calendar': ['calendar management', 'scheduling', 'appointment', 'calendar'],
            'research': ['research', 'market research', 'data research'],
            'bookkeeping': ['bookkeeping', 'quickbooks', 'accounting', 'invoicing', 'excel'],
            'customer_service': ['customer service', 'customer support', 'help desk', 'zendesk'],
            'travel': ['travel booking', 'travel arrangements', 'itinerary'],
            'project_management': ['project management', 'asana', 'trello', 'monday.com', 'notion'],
            'microsoft_office': ['microsoft office', 'word', 'excel', 'powerpoint', 'outlook'],
            'google_workspace': ['google workspace', 'gmail', 'google docs', 'google sheets'],
            'crm': ['salesforce', 'hubspot', 'crm', 'zoho'],
            'design': ['canva', 'photoshop', 'graphic design', 'design'],
            'wordpress': ['wordpress', 'website management', 'content management', 'cms'],
            'email_marketing': ['email marketing', 'mailchimp', 'klaviyo', 'newsletter'],
            'ai_tools': ['chatgpt', 'ai', 'artificial intelligence', 'automation', 'zapier'],
        }

        found_skills = []
        for skill, keywords in skill_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    found_skills.append(skill)
                    break

        return list(set(found_skills))[:10]

    def _extract_experience_level(self, text: str) -> str:
        """Extract experience level from text."""
        if not text:
            return 'any'

        text_lower = text.lower()

        if any(word in text_lower for word in ['senior', 'expert', '5+ years', '7+ years', '10+ years']):
            return 'expert'
        elif any(word in text_lower for word in ['mid-level', 'intermediate', '3+ years', '2+ years']):
            return 'intermediate'
        elif any(word in text_lower for word in ['entry level', 'junior', 'beginner', '0-1 years', 'no experience']):
            return 'entry'
        else:
            return 'any'

    def _parse_relative_time(self, time_text: str) -> Optional[datetime]:
        """Parse relative time like '2 hours ago' into datetime."""
        if not time_text:
            return datetime.utcnow()

        time_text = time_text.lower()
        now = datetime.utcnow()

        patterns = [
            (r'(\d+)\s+hour', lambda x: timedelta(hours=int(x))),
            (r'(\d+)\s+day', lambda x: timedelta(days=int(x))),
            (r'(\d+)\s+week', lambda x: timedelta(weeks=int(x))),
            (r'(\d+)\s+month', lambda x: timedelta(days=int(x) * 30)),
        ]

        for pattern, delta_func in patterns:
            match = re.search(pattern, time_text)
            if match:
                return now - delta_func(match.group(1))

        return now


# Singleton instance
playwright_scraper = PlaywrightScraperService()
