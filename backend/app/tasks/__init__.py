"""Celery tasks package."""
from app.tasks.scraper_tasks import (
    scrape_all_jobs,
    scrape_single_source,
    cleanup_old_jobs,
    update_match_scores,
    export_scraping_stats,
)

__all__ = [
    'scrape_all_jobs',
    'scrape_single_source',
    'cleanup_old_jobs',
    'update_match_scores',
    'export_scraping_stats',
]
