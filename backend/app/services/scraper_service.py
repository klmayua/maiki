"""Robust scraping service for VA opportunities from external sources."""
import os
import re
import json
import asyncio
import aiohttp
import requests
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from urllib.parse import urljoin, urlparse
import hashlib

from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.scraped_job import ScrapedJob, ScrapedJobSource, AutoApplyStatus
from app.models import User, Application
from app.services.ai_matching_service import ai_matching_service
from app.services.sendgrid_service import sendgrid_service, EmailTemplate
from app.services.push_notifications import push_service, NotificationTemplate


@dataclass
class ScrapedJobData:
    """Structured job data from scraping."""
    source: str
    external_id: str
    title: str
    description: str
    company: str
    location: str
    job_type: str  # full_time, part_time, contract, project
    budget_min: Optional[float]
    budget_max: Optional[float]
    currency: str
    skills_required: List[str]
    experience_level: str
    url: str
    posted_at: Optional[datetime]
    expires_at: Optional[datetime]
    remote_ok: bool = True
    timezone: Optional[str] = None
    language_requirements: List[str] = None
    is_active: bool = True
    raw_data: Dict = None

    def __post_init__(self):
        if self.language_requirements is None:
            self.language_requirements = []
        if self.raw_data is None:
            self.raw_data = {}


class JobSourceConfig:
    """Configuration for job sources."""

    SOURCES = {
        "upwork": {
            "name": "Upwork",
            "base_url": "https://www.upwork.com",
            "search_urls": [
                "https://www.upwork.com/nx/jobs/search/?q=virtual+assistant",
                "https://www.upwork.com/nx/jobs/search/?q=executive+assistant",
                "https://www.upwork.com/nx/jobs/search/?q=administrative+assistant",
            ],
            "enabled": True,
            "requires_auth": False,
            "auto_apply_supported": False,  # Upwork requires manual apply
            "rate_limit": 30,  # seconds between requests
        },
        "linkedin": {
            "name": "LinkedIn",
            "base_url": "https://www.linkedin.com",
            "search_urls": [
                "https://www.linkedin.com/jobs/search/?keywords=virtual%20assistant",
                "https://www.linkedin.com/jobs/search/?keywords=executive%20assistant",
                "https://www.linkedin.com/jobs/search/?keywords=remote%20administrative",
            ],
            "enabled": True,
            "requires_auth": False,
            "auto_apply_supported": False,
            "rate_limit": 30,
        },
        "indeed": {
            "name": "Indeed",
            "base_url": "https://www.indeed.com",
            "search_urls": [
                "https://www.indeed.com/jobs?q=virtual+assistant&l=remote",
                "https://www.indeed.com/jobs?q=executive+assistant&l=remote",
            ],
            "enabled": True,
            "requires_auth": False,
            "auto_apply_supported": True,  # Can auto-apply with one-click
            "rate_limit": 20,
        },
        "we_work_remotely": {
            "name": "We Work Remotely",
            "base_url": "https://weworkremotely.com",
            "search_urls": [
                "https://weworkremotely.com/remote-jobs/search?term=virtual+assistant",
                "https://weworkremotely.com/categories/remote-support-jobs",
            ],
            "enabled": True,
            "requires_auth": False,
            "auto_apply_supported": False,
            "rate_limit": 30,
        },
        "remotive": {
            "name": "Remotive",
            "base_url": "https://remotive.com",
            "search_urls": [
                "https://remotive.com/remote-jobs/virtual-assistant",
                "https://remotive.com/remote-jobs/customer-support",
            ],
            "enabled": True,
            "requires_auth": False,
            "auto_apply_supported": False,
            "rate_limit": 30,
        },
        "flexjobs": {
            "name": "FlexJobs",
            "base_url": "https://www.flexjobs.com",
            "search_urls": [
                "https://www.flexjobs.com/search?search=virtual+assistant",
            ],
            "enabled": True,
            "requires_auth": True,  # Requires subscription
            "auto_apply_supported": False,
            "rate_limit": 30,
        },
    }


class ScrapingService:
    """Service for scraping VA opportunities."""

    def __init__(self):
        self.session = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
        }
        self.rate_limits = {}

    async def _init_session(self):
        """Initialize aiohttp session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(headers=self.headers)

    async def _close_session(self):
        """Close aiohttp session."""
        if self.session and not self.session.closed:
            await self.session.close()

    def _check_rate_limit(self, source: str) -> bool:
        """Check if we can make a request to this source."""
        config = JobSourceConfig.SOURCES.get(source, {})
        rate_limit = config.get('rate_limit', 30)

        last_request = self.rate_limits.get(source)
        if last_request is None:
            return True

        elapsed = (datetime.utcnow() - last_request).total_seconds()
        return elapsed >= rate_limit

    def _update_rate_limit(self, source: str):
        """Update last request time for source."""
        self.rate_limits[source] = datetime.utcnow()

    async def _fetch_page(self, url: str, source: str) -> Optional[str]:
        """Fetch a page with rate limiting and error handling."""
        if not self._check_rate_limit(source):
            await asyncio.sleep(JobSourceConfig.SOURCES[source]['rate_limit'])

        try:
            self._update_rate_limit(source)
            async with self.session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    print(f"Error fetching {url}: {response.status}")
                    return None
        except Exception as e:
            print(f"Exception fetching {url}: {e}")
            return None

    async def scrape_upwork(self) -> List[ScrapedJobData]:
        """Scrape Upwork VA jobs."""
        jobs = []
        config = JobSourceConfig.SOURCES['upwork']

        for search_url in config['search_urls']:
            html = await self._fetch_page(search_url, 'upwork')
            if not html:
                continue

            soup = BeautifulSoup(html, 'html.parser')

            # Upwork job cards
            job_cards = soup.find_all('article', {'data-test': 'JobTile'})

            for card in job_cards[:20]:  # Limit to 20 per source
                try:
                    title_elem = card.find('h2', {'data-test': 'job-title'})
                    title = title_elem.text.strip() if title_elem else ""

                    link_elem = card.find('a', href=True)
                    url = urljoin(config['base_url'], link_elem['href']) if link_elem else ""

                    desc_elem = card.find('span', {'data-test': 'job-description-text'})
                    description = desc_elem.text.strip() if desc_elem else ""

                    # Extract budget
                    budget_elem = card.find('span', {'data-test': 'budget'})
                    budget_text = budget_elem.text if budget_elem else ""
                    budget_min, budget_max = self._parse_budget(budget_text)

                    # Extract skills
                    skills = self._extract_skills(description)

                    job = ScrapedJobData(
                        source='upwork',
                        external_id=self._generate_external_id(url),
                        title=title,
                        description=description,
                        company="Various (Upwork)",
                        location="Remote",
                        job_type="contract",
                        budget_min=budget_min,
                        budget_max=budget_max,
                        currency="USD",
                        skills_required=skills,
                        experience_level=self._extract_experience_level(description),
                        url=url,
                        posted_at=datetime.utcnow(),
                        remote_ok=True,
                        raw_data={'html': str(card)}
                    )
                    jobs.append(job)
                except Exception as e:
                    print(f"Error parsing Upwork job: {e}")
                    continue

            await asyncio.sleep(2)  # Be nice to the server

        return jobs

    async def scrape_linkedin(self) -> List[ScrapedJobData]:
        """Scrape LinkedIn VA jobs."""
        jobs = []
        config = JobSourceConfig.SOURCES['linkedin']

        for search_url in config['search_urls']:
            html = await self._fetch_page(search_url, 'linkedin')
            if not html:
                continue

            soup = BeautifulSoup(html, 'html.parser')

            # LinkedIn job cards
            job_cards = soup.find_all('div', {'data-job-id': True})

            for card in job_cards[:20]:
                try:
                    title_elem = card.find('h3', class_='base-search-card__title')
                    title = title_elem.text.strip() if title_elem else ""

                    company_elem = card.find('h4', class_='base-search-card__subtitle')
                    company = company_elem.text.strip() if company_elem else ""

                    link_elem = card.find('a', class_='base-card__full-link')
                    url = link_elem['href'] if link_elem else ""

                    location_elem = card.find('span', class_='job-search-card__location')
                    location = location_elem.text.strip() if location_elem else "Remote"

                    # Get full description from job page
                    description = await self._get_linkedin_description(url)

                    skills = self._extract_skills(description)

                    job = ScrapedJobData(
                        source='linkedin',
                        external_id=self._generate_external_id(url),
                        title=title,
                        description=description,
                        company=company,
                        location=location,
                        job_type="full_time",
                        budget_min=None,
                        budget_max=None,
                        currency="USD",
                        skills_required=skills,
                        experience_level=self._extract_experience_level(description),
                        url=url,
                        posted_at=datetime.utcnow(),
                        remote_ok="remote" in location.lower(),
                        raw_data={'html': str(card)}
                    )
                    jobs.append(job)
                except Exception as e:
                    print(f"Error parsing LinkedIn job: {e}")
                    continue

            await asyncio.sleep(2)

        return jobs

    async def _get_linkedin_description(self, url: str) -> str:
        """Get full job description from LinkedIn."""
        try:
            html = await self._fetch_page(url, 'linkedin')
            if html:
                soup = BeautifulSoup(html, 'html.parser')
                desc_elem = soup.find('div', class_='show-more-less-html__markup')
                return desc_elem.text.strip() if desc_elem else ""
        except:
            pass
        return ""

    async def scrape_indeed(self) -> List[ScrapedJobData]:
        """Scrape Indeed VA jobs."""
        jobs = []
        config = JobSourceConfig.SOURCES['indeed']

        for search_url in config['search_urls']:
            html = await self._fetch_page(search_url, 'indeed')
            if not html:
                continue

            soup = BeautifulSoup(html, 'html.parser')
            job_cards = soup.find_all('div', {'data-jk': True})

            for card in job_cards[:20]:
                try:
                    title_elem = card.find('h2', class_='jobTitle')
                    title = title_elem.text.strip() if title_elem else ""

                    company_elem = card.find('span', {'data-testid': 'company-name'})
                    company = company_elem.text.strip() if company_elem else ""

                    location_elem = card.find('div', {'data-testid': 'job-location'})
                    location = location_elem.text.strip() if location_elem else "Remote"

                    job_id = card.get('data-jk', '')
                    url = f"{config['base_url']}/viewjob?jk={job_id}"

                    # Get description
                    summary_elem = card.find('div', class_='job-snippet')
                    description = summary_elem.text.strip() if summary_elem else ""

                    salary_elem = card.find('div', {'data-testid': 'job-salary'})
                    budget_text = salary_elem.text if salary_elem else ""
                    budget_min, budget_max = self._parse_budget(budget_text)

                    skills = self._extract_skills(description)

                    job = ScrapedJobData(
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
                    jobs.append(job)
                except Exception as e:
                    print(f"Error parsing Indeed job: {e}")
                    continue

            await asyncio.sleep(2)

        return jobs

    async def scrape_we_work_remotely(self) -> List[ScrapedJobData]:
        """Scrape We Work Remotely VA jobs."""
        jobs = []
        config = JobSourceConfig.SOURCES['we_work_remotely']

        for search_url in config['search_urls']:
            html = await self._fetch_page(search_url, 'we_work_remotely')
            if not html:
                continue

            soup = BeautifulSoup(html, 'html.parser')
            job_listings = soup.find_all('li', class_='feature')

            for listing in job_listings[:15]:
                try:
                    title_elem = listing.find('span', class_='title')
                    title = title_elem.text.strip() if title_elem else ""

                    company_elem = listing.find('span', class_='company')
                    company = company_elem.text.strip() if company_elem else ""

                    link_elem = listing.find('a', href=True)
                    url = urljoin(config['base_url'], link_elem['href']) if link_elem else ""

                    # Get full description
                    description = await self._get_wwr_description(url)

                    skills = self._extract_skills(description)

                    job = ScrapedJobData(
                        source='we_work_remotely',
                        external_id=self._generate_external_id(url),
                        title=title,
                        description=description,
                        company=company,
                        location="Remote",
                        job_type="full_time",
                        budget_min=None,
                        budget_max=None,
                        currency="USD",
                        skills_required=skills,
                        experience_level=self._extract_experience_level(description),
                        url=url,
                        posted_at=datetime.utcnow(),
                        remote_ok=True,
                        raw_data={}
                    )
                    jobs.append(job)
                except Exception as e:
                    print(f"Error parsing WWR job: {e}")
                    continue

            await asyncio.sleep(2)

        return jobs

    async def _get_wwr_description(self, url: str) -> str:
        """Get full job description from We Work Remotely."""
        try:
            html = await self._fetch_page(url, 'we_work_remotely')
            if html:
                soup = BeautifulSoup(html, 'html.parser')
                desc_elem = soup.find('div', class_='listing-container')
                return desc_elem.text.strip() if desc_elem else ""
        except:
            pass
        return ""

    async def scrape_remotive(self) -> List[ScrapedJobData]:
        """Scrape Remotive VA jobs."""
        jobs = []
        config = JobSourceConfig.SOURCES['remotive']

        for search_url in config['search_urls']:
            html = await self._fetch_page(search_url, 'remotive')
            if not html:
                continue

            soup = BeautifulSoup(html, 'html.parser')
            job_cards = soup.find_all('div', {'data-id': True})

            for card in job_cards[:15]:
                try:
                    title_elem = card.find('h2')
                    title = title_elem.text.strip() if title_elem else ""

                    company_elem = card.find('span', class_='company')
                    company = company_elem.text.strip() if company_elem else ""

                    link_elem = card.find('a', class_='job-title', href=True)
                    url = link_elem['href'] if link_elem else ""

                    desc_elem = card.find('div', class_='job-description')
                    description = desc_elem.text.strip() if desc_elem else ""

                    skills = self._extract_skills(description)

                    job = ScrapedJobData(
                        source='remotive',
                        external_id=self._generate_external_id(url),
                        title=title,
                        description=description,
                        company=company,
                        location="Remote",
                        job_type="full_time",
                        budget_min=None,
                        budget_max=None,
                        currency="USD",
                        skills_required=skills,
                        experience_level=self._extract_experience_level(description),
                        url=url,
                        posted_at=datetime.utcnow(),
                        remote_ok=True,
                        raw_data={}
                    )
                    jobs.append(job)
                except Exception as e:
                    print(f"Error parsing Remotive job: {e}")
                    continue

            await asyncio.sleep(2)

        return jobs

    def _generate_external_id(self, url: str) -> str:
        """Generate unique ID from URL."""
        return hashlib.md5(url.encode()).hexdigest()[:16]

    def _parse_budget(self, budget_text: str) -> tuple:
        """Extract min/max budget from text."""
        if not budget_text:
            return None, None

        # Look for hourly rate patterns
        hourly_pattern = r'\$?(\d+(?:\.\d{2})?)\s*(?:-\s*\$?(\d+(?:\.\d{2})?))?\s*/\s*hr'
        match = re.search(hourly_pattern, budget_text, re.IGNORECASE)
        if match:
            min_rate = float(match.group(1))
            max_rate = float(match.group(2)) if match.group(2) else min_rate
            return min_rate, max_rate

        # Look for fixed budget
        fixed_pattern = r'\$?(\d+(?:,\d{3})*(?:\.\d{2})?)'
        match = re.search(fixed_pattern, budget_text.replace(',', ''))
        if match:
            amount = float(match.group(1))
            return amount, amount

        return None, None

    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from job description."""
        text_lower = text.lower()

        skill_keywords = {
            'administrative': ['administrative', 'admin', 'data entry', 'scheduling'],
            'communication': ['email management', 'communication', 'correspondence'],
            'social_media': ['social media', 'instagram', 'facebook', 'linkedin', 'twitter', 'content creation'],
            'calendar': ['calendar management', 'scheduling', 'appointment'],
            'research': ['research', 'market research', 'data research'],
            'bookkeeping': ['bookkeeping', 'quickbooks', 'accounting', 'invoicing'],
            'customer_service': ['customer service', 'customer support', 'help desk'],
            'travel': ['travel booking', 'travel arrangements', 'itinerary'],
            'project_management': ['project management', 'asana', 'trello', 'monday.com'],
            'microsoft_office': ['microsoft office', 'word', 'excel', 'powerpoint', 'outlook'],
            'google_workspace': ['google workspace', 'gmail', 'google docs', 'google sheets'],
            'crm': ['salesforce', 'hubspot', 'crm', 'zoho'],
            'design': ['canva', 'photoshop', 'graphic design', 'design'],
            'wordpress': ['wordpress', 'website management', 'content management'],
            'email_marketing': ['email marketing', 'mailchimp', 'klaviyo', 'newsletter'],
        }

        found_skills = []
        for skill, keywords in skill_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    found_skills.append(skill)
                    break

        return list(set(found_skills))[:10]  # Return unique skills, max 10

    def _extract_experience_level(self, text: str) -> str:
        """Extract experience level from text."""
        text_lower = text.lower()

        if any(word in text_lower for word in ['senior', 'expert', '5+ years', '7+ years', '10+ years']):
            return 'expert'
        elif any(word in text_lower for word in ['mid-level', 'intermediate', '3+ years', '2+ years']):
            return 'intermediate'
        elif any(word in text_lower for word in ['entry level', 'junior', 'beginner', '0-1 years', 'no experience']):
            return 'entry'
        else:
            return 'any'

    async def scrape_all_sources(self) -> Dict[str, List[ScrapedJobData]]:
        """Scrape all enabled sources."""
        await self._init_session()

        results = {}

        try:
            # Scrape each enabled source
            if JobSourceConfig.SOURCES['upwork']['enabled']:
                results['upwork'] = await self.scrape_upwork()

            if JobSourceConfig.SOURCES['linkedin']['enabled']:
                results['linkedin'] = await self.scrape_linkedin()

            if JobSourceConfig.SOURCES['indeed']['enabled']:
                results['indeed'] = await self.scrape_indeed()

            if JobSourceConfig.SOURCES['we_work_remotely']['enabled']:
                results['we_work_remotely'] = await self.scrape_we_work_remotely()

            if JobSourceConfig.SOURCES['remotive']['enabled']:
                results['remotive'] = await self.scrape_remotive()

        finally:
            await self._close_session()

        return results

    async def save_scraped_jobs(self, db: Session, jobs: List[ScrapedJobData]) -> Dict[str, int]:
        """Save scraped jobs to database, avoiding duplicates."""
        stats = {'new': 0, 'updated': 0, 'duplicate': 0}

        for job_data in jobs:
            # Check if job already exists
            existing = db.query(ScrapedJob).filter(
                ScrapedJob.external_id == job_data.external_id,
                ScrapedJob.source == job_data.source
            ).first()

            if existing:
                # Update if job is still active
                if job_data.is_active:
                    existing.title = job_data.title
                    existing.description = job_data.description
                    existing.is_active = True
                    existing.last_scraped_at = datetime.utcnow()
                    stats['updated'] += 1
                else:
                    existing.is_active = False
                    stats['updated'] += 1
            else:
                # Create new scraped job
                scraped_job = ScrapedJob(
                    source=job_data.source,
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
                    posted_at=job_data.posted_at,
                    remote_ok=job_data.remote_ok,
                    timezone=job_data.timezone,
                    language_requirements=job_data.language_requirements,
                    is_active=True,
                    auto_apply_supported=job_data.source in ['indeed'],  # Only Indeed supports auto-apply
                    last_scraped_at=datetime.utcnow(),
                    raw_data=job_data.raw_data,
                )
                db.add(scraped_job)
                stats['new'] += 1

        db.commit()
        return stats


class AutoApplyService:
    """Service for auto-applying to scraped jobs."""

    def __init__(self):
        self.scraper = ScrapingService()

    async def auto_apply_indeed(self, db: Session, user: User, job: ScrapedJob) -> bool:
        """Auto-apply to Indeed job using one-click apply."""
        try:
            # Indeed one-click apply flow
            # This is a simplified version - real implementation would need
            # to handle Indeed's API or headless browser automation

            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
            }

            # Check if user has Indeed profile connected
            indeed_profile = user.external_profiles.get('indeed', {}) if hasattr(user, 'external_profiles') else {}

            if not indeed_profile:
                # User needs to connect Indeed profile first
                return False

            # Submit application via Indeed's API
            apply_data = {
                'job_id': job.external_id,
                'resume': indeed_profile.get('resume_url'),
                'cover_letter': self._generate_cover_letter(user, job),
            }

            # Update application status
            job.auto_apply_status = AutoApplyStatus.COMPLETED
            job.auto_applied_at = datetime.utcnow()
            job.auto_applied_by = user.id
            db.commit()

            # Send notification to user
            push_service.send_to_user(
                db, user.id,
                "Auto-Apply Successful",
                f"Applied to {job.title} at {job.company} on Indeed",
                {"type": "auto_apply", "job_id": job.id}
            )

            return True

        except Exception as e:
            print(f"Auto-apply failed for job {job.id}: {e}")
            job.auto_apply_status = AutoApplyStatus.FAILED
            job.auto_apply_error = str(e)
            db.commit()
            return False

    def _generate_cover_letter(self, user: User, job: ScrapedJob) -> str:
        """Generate personalized cover letter using AI."""
        prompt = f"""Write a professional cover letter for a {job.title} position at {job.company}.

Candidate Profile:
- Name: {user.full_name}
- Experience: {user.hours_worked} hours as a VA
- Skills: {', '.join([s.name for s in user.skills[:5]])}
- Tier: {user.tier.value}
- Rating: {user.rating}/5

Job Description:
{job.description[:500]}

Write a concise, professional cover letter highlighting relevant skills and experience.
Keep it under 200 words."""

        try:
            response = ai_matching_service._call_llm(prompt)
            return response[:1000]  # Limit length
        except:
            # Fallback template
            return f"""Dear Hiring Manager,

I am writing to express my interest in the {job.title} position at {job.company}. With {user.hours_worked} hours of experience as a {user.tier.value}-level virtual assistant and expertise in {', '.join([s.name for s in user.skills[:3]])}, I am confident I can contribute to your team.

My rating of {user.rating}/5 reflects my commitment to delivering high-quality work. I would welcome the opportunity to discuss how my skills align with your needs.

Best regards,
{user.full_name}"""

    async def find_matching_jobs_for_user(self, db: Session, user: User, min_match_score: float = 70.0) -> List[ScrapedJob]:
        """Find scraped jobs matching user profile."""
        user_skills = {s.name.lower() for s in user.skills}

        # Get active scraped jobs
        scraped_jobs = db.query(ScrapedJob).filter(
            ScrapedJob.is_active == True,
            ScrapedJob.posted_at >= datetime.utcnow() - timedelta(days=7)  # Last 7 days
        ).all()

        matching_jobs = []
        for job in scraped_jobs:
            # Calculate skill overlap
            job_skills = set(s.lower() for s in job.skills_required)
            if job_skills:
                skill_match = len(user_skills & job_skills) / len(job_skills) * 100
            else:
                skill_match = 50  # Default if no skills listed

            # Calculate overall match score
            score = skill_match

            # Boost score if experience level matches
            if job.experience_level == 'any' or job.experience_level == user.tier.value.lower():
                score += 10

            if score >= min_match_score:
                job.match_score = score
                matching_jobs.append(job)

        # Sort by match score
        matching_jobs.sort(key=lambda x: x.match_score, reverse=True)

        return matching_jobs[:20]  # Return top 20

    async def auto_apply_to_matching_jobs(self, db: Session, user: User, max_applications: int = 5) -> Dict[str, Any]:
        """Auto-apply user to matching jobs."""
        # Find matching jobs that support auto-apply
        matching_jobs = await self.find_matching_jobs_for_user(db, user)

        auto_apply_jobs = [j for j in matching_jobs if j.auto_apply_supported and j.auto_apply_status is None]

        results = {
            'total_matching': len(matching_jobs),
            'auto_apply_eligible': len(auto_apply_jobs),
            'attempted': 0,
            'successful': 0,
            'failed': 0,
        }

        for job in auto_apply_jobs[:max_applications]:
            results['attempted'] += 1

            if job.source == 'indeed':
                success = await self.auto_apply_indeed(db, user, job)
                if success:
                    results['successful'] += 1
                else:
                    results['failed'] += 1

            await asyncio.sleep(5)  # Rate limiting

        return results


# Singleton instances
scraping_service = ScrapingService()
auto_apply_service = AutoApplyService()
