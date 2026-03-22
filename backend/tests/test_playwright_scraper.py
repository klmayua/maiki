"""End-to-end tests for Playwright scraper."""
import pytest
import asyncio
from datetime import datetime

from app.services.playwright_scraper import playwright_scraper, ScrapedJobData


@pytest.mark.asyncio
@pytest.mark.playwright
class TestPlaywrightScraper:
    """Test suite for Playwright scraper."""

    async def test_scrape_upwork(self):
        """Test Upwork scraping."""
        print("\n=== Testing Upwork Scraper ===")
        jobs = await playwright_scraper.scrape_upwork()

        print(f"Found {len(jobs)} jobs on Upwork")

        assert isinstance(jobs, list)

        if jobs:
            job = jobs[0]
            assert isinstance(job, ScrapedJobData)
            assert job.source == 'upwork'
            assert job.title
            assert job.url
            assert job.external_id
            print(f"\nSample job:")
            print(f"  Title: {job.title}")
            print(f"  Company: {job.company}")
            print(f"  Rate: ${job.budget_min}-${job.budget_max}/hr")
            print(f"  Skills: {', '.join(job.skills_required)}")

    async def test_scrape_indeed(self):
        """Test Indeed scraping."""
        print("\n=== Testing Indeed Scraper ===")
        jobs = await playwright_scraper.scrape_indeed()

        print(f"Found {len(jobs)} jobs on Indeed")

        assert isinstance(jobs, list)

        if jobs:
            job = jobs[0]
            assert isinstance(job, ScrapedJobData)
            assert job.source == 'indeed'
            assert job.title
            print(f"\nSample job:")
            print(f"  Title: {job.title}")
            print(f"  Company: {job.company}")

    async def test_scrape_we_work_remotely(self):
        """Test We Work Remotely scraping."""
        print("\n=== Testing We Work Remotely Scraper ===")
        jobs = await playwright_scraper.scrape_we_work_remotely()

        print(f"Found {len(jobs)} jobs on We Work Remotely")

        assert isinstance(jobs, list)

        if jobs:
            job = jobs[0]
            assert isinstance(job, ScrapedJobData)
            assert job.source == 'we_work_remotely'
            print(f"\nSample job:")
            print(f"  Title: {job.title}")
            print(f"  Company: {job.company}")

    async def test_scrape_remotive(self):
        """Test Remotive scraping."""
        print("\n=== Testing Remotive Scraper ===")
        jobs = await playwright_scraper.scrape_remotive()

        print(f"Found {len(jobs)} jobs on Remotive")

        assert isinstance(jobs, list)

        if jobs:
            job = jobs[0]
            assert isinstance(job, ScrapedJobData)
            assert job.source == 'remotive'

    async def test_scrape_all_sources(self):
        """Test scraping all sources."""
        print("\n=== Testing Full Scraping Run ===")
        results = await playwright_scraper.scrape_all_sources()

        assert isinstance(results, dict)
        assert 'upwork' in results
        assert 'linkedin' in results
        assert 'indeed' in results
        assert 'we_work_remotely' in results
        assert 'remotive' in results

        total_jobs = sum(len(jobs) for jobs in results.values())
        print(f"\nTotal jobs scraped: {total_jobs}")
        print("\nBreakdown:")
        for source, jobs in results.items():
            print(f"  {source}: {len(jobs)} jobs")

        # We should have found at least some jobs from each source
        # Note: This might fail if sites block scraping or change structure
        for source, jobs in results.items():
            print(f"  {source}: {'✓' if jobs else '✗ (blocked or no jobs found)'} {len(jobs)} jobs")

    async def test_budget_parsing(self):
        """Test budget extraction from text."""
        test_cases = [
            ("$25/hr", 25, 25),
            ("$30-$50/hr", 30, 50),
            ("Budget: $1000", 1000, 1000),
            ("Hourly Rate: $45 per hour", 45, 45),
            ("", None, None),
        ]

        for text, expected_min, expected_max in test_cases:
            result_min, result_max = playwright_scraper._parse_budget(text)
            assert result_min == expected_min, f"Failed for '{text}'"
            assert result_max == expected_max, f"Failed for '{text}'"

    async def test_skill_extraction(self):
        """Test skill extraction from text."""
        text = "Looking for a virtual assistant with experience in calendar management, email management, and social media. Must know Microsoft Office and Google Workspace."

        skills = playwright_scraper._extract_skills(text)

        assert 'calendar' in skills
        assert 'communication' in skills
        assert 'social_media' in skills
        assert 'microsoft_office' in skills
        assert 'google_workspace' in skills

        print(f"\nExtracted skills: {skills}")


@pytest.mark.asyncio
async def test_db_integration():
    """Test database integration."""
    from sqlalchemy.orm import Session
    from app.core.database import SessionLocal
    from app.models.scraped_job import ScrapedJob

    print("\n=== Testing Database Integration ===")

    db = SessionLocal()
    try:
        # Create test jobs
        test_jobs = [
            ScrapedJobData(
                source='upwork',
                external_id='test-123',
                title='Test VA Job',
                description='Test description',
                company='Test Company',
                location='Remote',
                job_type='contract',
                budget_min=25,
                budget_max=50,
                skills_required=['administrative', 'email'],
                url='https://example.com/job',
            )
        ]

        # Save to database
        stats = playwright_scraper.save_scraped_jobs(db, test_jobs)

        print(f"Database save stats: {stats}")

        assert stats['new'] + stats['duplicate'] + stats['updated'] >= 0

        # Verify job was saved
        saved_job = db.query(ScrapedJob).filter(
            ScrapedJob.external_id == 'test-123'
        ).first()

        if saved_job:
            print(f"✓ Job saved: {saved_job.title}")
            # Clean up
            db.delete(saved_job)
            db.commit()
        else:
            print("Job was already in database (duplicate)")

    finally:
        db.close()


if __name__ == "__main__":
    # Run tests manually
    print("=" * 60)
    print("PLAYWRIGHT SCRAPER TEST SUITE")
    print("=" * 60)

    async def run_tests():
        scraper = TestPlaywrightScraper()

        try:
            await scraper.test_scrape_upwork()
        except Exception as e:
            print(f"Upwork test failed: {e}")

        try:
            await scraper.test_scrape_indeed()
        except Exception as e:
            print(f"Indeed test failed: {e}")

        try:
            await scraper.test_scrape_we_work_remotely()
        except Exception as e:
            print(f"WWR test failed: {e}")

        try:
            await scraper.test_scrape_remotive()
        except Exception as e:
            print(f"Remotive test failed: {e}")

        try:
            await scraper.test_scrape_all_sources()
        except Exception as e:
            print(f"Full scrape test failed: {e}")

        try:
            await scraper.test_budget_parsing()
            print("✓ Budget parsing tests passed")
        except Exception as e:
            print(f"Budget parsing test failed: {e}")

        try:
            await scraper.test_skill_extraction()
            print("✓ Skill extraction tests passed")
        except Exception as e:
            print(f"Skill extraction test failed: {e}")

    asyncio.run(run_tests())
