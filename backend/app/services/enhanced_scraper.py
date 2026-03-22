"""Enhanced scraper with proxy rotation and CAPTCHA solving."""
import os
import asyncio
import aiohttp
from typing import Optional, List, Dict
from datetime import datetime

# Try to import optional dependencies
try:
    from twocaptcha import TwoCaptcha
    TWOCAPTCHA_AVAILABLE = True
except ImportError:
    TWOCAPTCHA_AVAILABLE = False

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

from app.services.scraper_service import ScrapingService, ScrapedJobData, JobSourceConfig


class ProxyRotator:
    """Rotate through proxy pool."""

    def __init__(self):
        self.proxies = self._load_proxies()
        self.current_index = 0

    def _load_proxies(self) -> List[Dict[str, str]]:
        """Load proxies from environment or config."""
        proxy_list = []

        # Try to load from environment
        proxy_urls = os.getenv("PROXY_LIST", "").split(",")

        for url in proxy_urls:
            if url.strip():
                proxy_list.append({"http": url.strip(), "https": url.strip()})

        # If no proxies configured, return empty
        return proxy_list

    def get_next_proxy(self) -> Optional[Dict[str, str]]:
        """Get next proxy in rotation."""
        if not self.proxies:
            return None

        proxy = self.proxies[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.proxies)
        return proxy


class CaptchaSolver:
    """CAPTCHA solving service."""

    def __init__(self):
        self.api_key = os.getenv("TWOCAPTCHA_API_KEY")
        self.solver = None

        if self.api_key and TWOCAPTCHA_AVAILABLE:
            self.solver = TwoCaptcha(self.api_key)

    async def solve_recaptcha(self, site_key: str, page_url: str) -> Optional[str]:
        """Solve reCAPTCHA using 2captcha."""
        if not self.solver:
            return None

        try:
            result = self.solver.recaptcha(
                sitekey=site_key,
                url=page_url
            )
            return result.get("code")
        except Exception as e:
            print(f"CAPTCHA solving failed: {e}")
            return None

    async def solve_hcaptcha(self, site_key: str, page_url: str) -> Optional[str]:
        """Solve hCaptcha using 2captcha."""
        if not self.solver:
            return None

        try:
            result = self.solver.hcaptcha(
                sitekey=site_key,
                url=page_url
            )
            return result.get("code")
        except Exception as e:
            print(f"hCaptcha solving failed: {e}")
            return None


class HardenedScrapingService(ScrapingService):
    """Enhanced scraper with anti-bot measures."""

    def __init__(self):
        super().__init__()
        self.proxy_rotator = ProxyRotator()
        self.captcha_solver = CaptchaSolver()
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
        ]
        self.current_ua_index = 0

    def _get_next_user_agent(self) -> str:
        """Rotate user agents."""
        ua = self.user_agents[self.current_ua_index]
        self.current_ua_index = (self.current_ua_index + 1) % len(self.user_agents)
        return ua

    async def _fetch_page_with_proxy(self, url: str, source: str) -> Optional[str]:
        """Fetch page with proxy rotation."""
        proxy = self.proxy_rotator.get_next_proxy()

        headers = {
            **self.headers,
            "User-Agent": self._get_next_user_agent(),
        }

        try:
            if proxy:
                connector = aiohttp.TCPConnector(ssl=False)
                async with aiohttp.ClientSession(
                    headers=headers,
                    connector=connector
                ) as session:
                    async with session.get(
                        url,
                        proxy=proxy.get("http"),
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        if response.status == 200:
                            return await response.text()
                        elif response.status == 403:
                            print(f"Blocked by {source}, rotating proxy...")
                            return None
            else:
                # Fallback to direct request
                return await self._fetch_page(url, source)

        except Exception as e:
            print(f"Proxy request failed: {e}")
            return None

    async def scrape_with_selenium(self, url: str) -> Optional[str]:
        """Use Selenium for JavaScript-heavy sites."""
        if not SELENIUM_AVAILABLE:
            return None

        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument(f"--user-agent={self._get_next_user_agent()}")

        # Use proxy if available
        proxy = self.proxy_rotator.get_next_proxy()
        if proxy:
            proxy_url = proxy.get("http", "").replace("http://", "").replace("https://", "")
            if proxy_url:
                options.add_argument(f"--proxy-server={proxy_url}")

        driver = None
        try:
            driver = webdriver.Chrome(options=options)
            driver.get(url)

            # Wait for content to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )

            # Additional wait for dynamic content
            await asyncio.sleep(3)

            html = driver.page_source
            return html

        except Exception as e:
            print(f"Selenium scraping failed: {e}")
            return None

        finally:
            if driver:
                driver.quit()

    async def scrape_upwork_enhanced(self) -> List[ScrapedJobData]:
        """Enhanced Upwork scraper with Selenium fallback."""
        # Try regular scraping first
        jobs = await self.scrape_upwork()

        # If no results, try Selenium
        if not jobs:
            print("Regular scraping failed, trying Selenium...")
            config = JobSourceConfig.SOURCES['upwork']

            for search_url in config['search_urls']:
                html = await self.scrape_with_selenium(search_url)
                if html:
                    # Parse HTML (would need to implement parsing logic)
                    pass

        return jobs


class ScrapingScheduler:
    """Celery scheduler for automated scraping."""

    def __init__(self):
        self.scraper = HardenedScrapingService()

    async def run_scheduled_scrape(self, sources: Optional[List[str]] = None):
        """Run scraping for all or specified sources."""
        if sources is None:
            sources = ['upwork', 'linkedin', 'indeed', 'we_work_remotely', 'remotive']

        results = {}

        for source in sources:
            try:
                if source == 'upwork':
                    jobs = await self.scraper.scrape_upwork_enhanced()
                elif source == 'linkedin':
                    jobs = await self.scraper.scrape_linkedin()
                elif source == 'indeed':
                    jobs = await self.scraper.scrape_indeed()
                elif source == 'we_work_remotely':
                    jobs = await self.scraper.scrape_we_work_remotely()
                elif source == 'remotive':
                    jobs = await self.scraper.scrape_remotive()

                results[source] = {
                    "status": "success",
                    "jobs_found": len(jobs),
                }

            except Exception as e:
                results[source] = {
                    "status": "failed",
                    "error": str(e),
                }

        return results


# Singleton instances
hardened_scraper = HardenedScrapingService()
scraping_scheduler = ScrapingScheduler()
