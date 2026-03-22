"""Celery configuration for background tasks."""
import os
from celery import Celery
from celery.signals import task_success, task_failure
from celery.schedules import crontab

# Set Django settings module (we're using FastAPI, but keeping compatibility)
os.environ.setdefault('CELERY_CONFIG_MODULE', 'app.core.celery_config')

# Create Celery app
celery_app = Celery(
    'maiki',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    include=['app.tasks.scraper_tasks']
)

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,

    # Task execution settings
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max per task
    task_soft_time_limit=3000,  # Soft limit 50 min

    # Worker settings
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,

    # Result settings
    result_expires=3600,
    result_backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),

    # Beat schedule (periodic tasks)
    beat_schedule={
        'scrape-jobs-every-2-hours': {
            'task': 'app.tasks.scraper_tasks.scrape_all_jobs',
            'schedule': 7200.0,  # 2 hours in seconds
            'options': {'queue': 'scraping'},
        },
        'cleanup-old-jobs-daily': {
            'task': 'app.tasks.scraper_tasks.cleanup_old_jobs',
            'schedule': crontab(hour=2, minute=0),  # 2 AM daily
            'options': {'queue': 'maintenance'},
        },
        'update-job-match-scores': {
            'task': 'app.tasks.scraper_tasks.update_match_scores',
            'schedule': 3600.0,  # Every hour
            'options': {'queue': 'ai'},
        },
    },

    # Default queue
    task_default_queue='default',
    task_routes={
        'app.tasks.scraper_tasks.*': {'queue': 'scraping'},
    },
)


def get_task_info():
    """Get information about registered tasks."""
    return {
        'registered_tasks': list(celery_app.tasks.keys()),
        'scheduled_tasks': celery_app.conf.beat_schedule,
    }
