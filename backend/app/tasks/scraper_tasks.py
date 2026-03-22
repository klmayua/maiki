"""Celery tasks for job scraping and maintenance."""
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List

from celery import shared_task
from celery.exceptions import SoftTimeLimitExceeded

from app.core.database import SessionLocal
from app.services.playwright_scraper import playwright_scraper, ScrapedJobData
from app.models.scraped_job import ScrapedJob, JobScrapeLog, ScrapedJobSource


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=300,  # Retry after 5 minutes
    queue='scraping',
)
def scrape_all_jobs(self) -> Dict:
    """
    Scrape jobs from all configured sources.
    This is the main entry point for scheduled scraping.
    """
    print("\n" + "="*50)
    print("STARTING SCHEDULED JOB SCRAPING")
    print("="*50 + "\n")

    db = SessionLocal()
    all_stats = {}
    total_jobs = {'new': 0, 'updated': 0, 'duplicate': 0, 'error': 0}

    try:
        # Run async scraping
        results = asyncio.run(playwright_scraper.scrape_all_sources())

        # Save results to database
        for source, jobs in results.items():
            print(f"\nSaving {len(jobs)} jobs from {source}...")

            stats = playwright_scraper.save_scraped_jobs(db, jobs)
            all_stats[source] = stats

            # Log the scrape
            playwright_scraper.log_scrape_run(db, source, stats)

            # Update totals
            for key in total_jobs:
                total_jobs[key] += stats.get(key, 0)

        print("\n" + "="*50)
        print("SCRAPING COMPLETE")
        print(f"New jobs: {total_jobs['new']}")
        print(f"Updated: {total_jobs['updated']}")
        print(f"Duplicates: {total_jobs['duplicate']}")
        print(f"Errors: {total_jobs['error']}")
        print("="*50 + "\n")

        return {
            'status': 'success',
            'timestamp': datetime.utcnow().isoformat(),
            'total_jobs': total_jobs,
            'by_source': all_stats,
        }

    except SoftTimeLimitExceeded:
        print("Task timed out!")
        raise

    except Exception as e:
        print(f"Error during scraping: {e}")
        self.retry(exc=e)

    finally:
        db.close()


@shared_task(
    bind=True,
    max_retries=2,
    queue='scraping',
)
def scrape_single_source(self, source: str) -> Dict:
    """
    Scrape jobs from a single source.
    Useful for testing or manual re-scraping.
    """
    print(f"Scraping single source: {source}")

    db = SessionLocal()

    try:
        # Run async scraping for single source
        if source == 'upwork':
            jobs = asyncio.run(playwright_scraper.scrape_upwork())
        elif source == 'linkedin':
            jobs = asyncio.run(playwright_scraper.scrape_linkedin())
        elif source == 'indeed':
            jobs = asyncio.run(playwright_scraper.scrape_indeed())
        elif source == 'we_work_remotely':
            jobs = asyncio.run(playwright_scraper.scrape_we_work_remotely())
        elif source == 'remotive':
            jobs = asyncio.run(playwright_scraper.scrape_remotive())
        else:
            return {'status': 'error', 'message': f'Unknown source: {source}'}

        stats = playwright_scraper.save_scraped_jobs(db, jobs)
        playwright_scraper.log_scrape_run(db, source, stats)

        return {
            'status': 'success',
            'source': source,
            'jobs_found': len(jobs),
            'stats': stats,
        }

    except Exception as e:
        return {'status': 'error', 'source': source, 'error': str(e)}

    finally:
        db.close()


@shared_task(queue='maintenance')
def cleanup_old_jobs() -> Dict:
    """
    Clean up old scraped jobs.
    Mark jobs older than 30 days as inactive.
    """
    db = SessionLocal()

    try:
        cutoff_date = datetime.utcnow() - timedelta(days=30)

        # Mark old jobs as inactive
        result = db.query(ScrapedJob).filter(
            ScrapedJob.posted_at < cutoff_date,
            ScrapedJob.is_active == True
        ).update({'is_active': False})

        db.commit()

        print(f"Cleaned up {result} old jobs")

        return {
            'status': 'success',
            'jobs_deactivated': result,
            'cutoff_date': cutoff_date.isoformat(),
        }

    except Exception as e:
        db.rollback()
        return {'status': 'error', 'error': str(e)}

    finally:
        db.close()


@shared_task(queue='ai')
def update_match_scores() -> Dict:
    """
    Update AI match scores for scraped jobs.
    This should be called after new jobs are scraped.
    """
    db = SessionLocal()

    try:
        # Get recent unscored jobs
        recent_jobs = db.query(ScrapedJob).filter(
            ScrapedJob.is_active == True,
            ScrapedJob.ai_summary == None
        ).limit(100).all()

        updated = 0
        for job in recent_jobs:
            # Simple scoring based on skills match (placeholder for AI)
            # In production, this would use the actual AI matching service
            job.ai_summary = f"Job posted by {job.company}"
            updated += 1

        db.commit()

        return {
            'status': 'success',
            'jobs_updated': updated,
        }

    except Exception as e:
        db.rollback()
        return {'status': 'error', 'error': str(e)}

    finally:
        db.close()


@shared_task(queue='maintenance')
def export_scraping_stats() -> Dict:
    """
    Export scraping statistics for monitoring.
    """
    db = SessionLocal()

    try:
        # Get stats from last 24 hours
        since = datetime.utcnow() - timedelta(days=1)

        logs = db.query(JobScrapeLog).filter(
            JobScrapeLog.created_at >= since
        ).all()

        stats = {
            'total_runs': len(logs),
            'total_jobs_found': sum(log.jobs_found for log in logs),
            'total_new': sum(log.jobs_new for log in logs),
            'total_errors': sum(log.jobs_failed for log in logs),
            'by_source': {},
        }

        # Group by source
        for log in logs:
            source = log.source.value
            if source not in stats['by_source']:
                stats['by_source'][source] = {'runs': 0, 'jobs': 0}
            stats['by_source'][source]['runs'] += 1
            stats['by_source'][source]['jobs'] += log.jobs_found

        return {
            'status': 'success',
            'period': '24h',
            'stats': stats,
        }

    except Exception as e:
        return {'status': 'error', 'error': str(e)}

    finally:
        db.close()
