"""API routes for scraped/external jobs."""
from typing import Any, List, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_

from app.deps import get_db, get_current_user
from app.models import User
from app.models.scraped_job import ScrapedJob, ScrapedJobSource, ScrapedJobMatch
from app.schemas.scraped_job import (
    ScrapedJobResponse, ScrapedJobListParams, ScrapedJobMatchCreate,
    ScrapedJobMatchResponse, JobScrapeLogResponse
)
from app.services.playwright_scraper import playwright_scraper
from app.tasks.scraper_tasks import scrape_single_source

router = APIRouter(prefix="/jobs/scraped", tags=["scraped-jobs"])


@router.get("/", response_model=List[ScrapedJobResponse])
def list_scraped_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    source: Optional[str] = Query(None, description="Filter by source (upwork, linkedin, indeed, etc.)"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    min_budget: Optional[float] = Query(None, description="Minimum hourly rate"),
    max_budget: Optional[float] = Query(None, description="Maximum hourly rate"),
    experience_level: Optional[str] = Query(None, description="Filter by experience (entry, intermediate, expert, any)"),
    remote_only: bool = Query(True, description="Only show remote jobs"),
    days_since_posted: int = Query(7, ge=1, le=30, description="Jobs posted within last N days"),
    skills: Optional[str] = Query(None, description="Comma-separated skills to filter"),
) -> Any:
    """
    List scraped jobs with filters and pagination.
    This is the main endpoint for the "Find VA Jobs" page.
    """
    query = db.query(ScrapedJob).filter(ScrapedJob.is_active == True)

    # Filter by source
    if source:
        try:
            source_enum = ScrapedJobSource(source)
            query = query.filter(ScrapedJob.source == source_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid source. Valid sources: {[s.value for s in ScrapedJobSource]}"
            )

    # Filter by posting date
    cutoff_date = datetime.utcnow() - timedelta(days=days_since_posted)
    query = query.filter(ScrapedJob.posted_at >= cutoff_date)

    # Filter by search text
    if search:
        search_filter = or_(
            ScrapedJob.title.ilike(f"%{search}%"),
            ScrapedJob.description.ilike(f"%{search}%"),
            ScrapedJob.company.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    # Filter by budget
    if min_budget:
        query = query.filter(
            or_(
                ScrapedJob.budget_min >= min_budget,
                ScrapedJob.budget_max >= min_budget
            )
        )
    if max_budget:
        query = query.filter(
            or_(
                ScrapedJob.budget_min <= max_budget,
                ScrapedJob.budget_max <= max_budget
            )
        )

    # Filter by experience level
    if experience_level:
        query = query.filter(ScrapedJob.experience_level == experience_level)

    # Filter by remote
    if remote_only:
        query = query.filter(ScrapedJob.remote_ok == True)

    # Filter by skills (if any skill matches)
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",")]
        for skill in skill_list:
            query = query.filter(ScrapedJob.skills_required.contains([skill]))

    # Order by newest first
    query = query.order_by(desc(ScrapedJob.posted_at))

    # Paginate
    total = query.count()
    jobs = query.offset(skip).limit(limit).all()

    # Add match scores for current user
    for job in jobs:
        job.match_score = calculate_match_score(current_user, job)
        job.is_saved = is_job_saved(db, current_user.id, job.id)

    # Set response headers for pagination
    from fastapi import Response
    # Note: In real implementation, you'd return these in headers or a meta object

    return jobs


@router.get("/{job_id}", response_model=ScrapedJobResponse)
def get_scraped_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get a specific scraped job by ID."""
    job = db.query(ScrapedJob).filter(
        ScrapedJob.id == job_id,
        ScrapedJob.is_active == True
    ).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Add user-specific data
    job.match_score = calculate_match_score(current_user, job)
    job.is_saved = is_job_saved(db, current_user.id, job.id)

    return job


@router.post("/{job_id}/save", response_model=ScrapedJobMatchResponse)
def save_scraped_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Save a scraped job for later."""
    # Check job exists
    job = db.query(ScrapedJob).filter(ScrapedJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Check if already saved
    existing = db.query(ScrapedJobMatch).filter(
        ScrapedJobMatch.scraped_job_id == job_id,
        ScrapedJobMatch.user_id == current_user.id
    ).first()

    if existing:
        existing.is_saved = True
        db.commit()
        return existing

    # Create new match/saved record
    match = ScrapedJobMatch(
        scraped_job_id=job_id,
        user_id=current_user.id,
        match_score=calculate_match_score(current_user, job),
        is_saved=True,
        created_at=datetime.utcnow()
    )
    db.add(match)
    db.commit()
    db.refresh(match)

    return match


@router.delete("/{job_id}/save")
def unsave_scraped_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Remove a saved scraped job."""
    match = db.query(ScrapedJobMatch).filter(
        ScrapedJobMatch.scraped_job_id == job_id,
        ScrapedJobMatch.user_id == current_user.id
    ).first()

    if match:
        match.is_saved = False
        db.commit()

    return {"message": "Job unsaved"}


@router.get("/saved/list", response_model=List[ScrapedJobResponse])
def list_saved_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Any:
    """List user's saved scraped jobs."""
    query = db.query(ScrapedJob).join(
        ScrapedJobMatch,
        and_(
            ScrapedJobMatch.scraped_job_id == ScrapedJob.id,
            ScrapedJobMatch.user_id == current_user.id,
            ScrapedJobMatch.is_saved == True
        )
    ).filter(ScrapedJob.is_active == True)

    jobs = query.offset(skip).limit(limit).all()

    for job in jobs:
        job.match_score = calculate_match_score(current_user, job)
        job.is_saved = True

    return jobs


@router.get("/stats/overview")
def get_scraping_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get overview statistics for scraped jobs."""
    # Total active jobs
    total_active = db.query(func.count(ScrapedJob.id)).filter(
        ScrapedJob.is_active == True
    ).scalar()

    # Jobs by source
    by_source = db.query(
        ScrapedJob.source,
        func.count(ScrapedJob.id)
    ).filter(
        ScrapedJob.is_active == True
    ).group_by(ScrapedJob.source).all()

    # Recent jobs (last 7 days)
    recent_count = db.query(func.count(ScrapedJob.id)).filter(
        ScrapedJob.is_active == True,
        ScrapedJob.posted_at >= datetime.utcnow() - timedelta(days=7)
    ).scalar()

    # Average budget range
    budget_stats = db.query(
        func.avg(ScrapedJob.budget_min),
        func.avg(ScrapedJob.budget_max)
    ).filter(
        ScrapedJob.is_active == True,
        ScrapedJob.budget_min.isnot(None)
    ).first()

    return {
        "total_active_jobs": total_active,
        "recent_jobs_7d": recent_count,
        "by_source": {s.value: c for s, c in by_source},
        "avg_budget": {
            "min": round(budget_stats[0], 2) if budget_stats[0] else None,
            "max": round(budget_stats[1], 2) if budget_stats[1] else None,
        }
    }


@router.post("/admin/trigger")
def trigger_manual_scrape(
    source: Optional[str] = Query(None, description="Specific source to scrape, or all if not provided"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Trigger a manual scrape (admin only).
    Returns immediately, scraping happens in background.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    if source:
        # Scrape single source
        task = scrape_single_source.delay(source)
        return {
            "message": f"Scraping {source} initiated",
            "task_id": task.id,
            "source": source,
        }
    else:
        # Scrape all sources
        from app.tasks.scraper_tasks import scrape_all_jobs
        task = scrape_all_jobs.delay()
        return {
            "message": "Full scraping run initiated",
            "task_id": task.id,
            "sources": ["upwork", "linkedin", "indeed", "we_work_remotely", "remotive"],
        }


@router.get("/admin/logs", response_model=List[JobScrapeLogResponse])
def get_scrape_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
) -> Any:
    """Get scraping logs (admin only)."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    logs = db.query(JobScrapeLog).order_by(
        desc(JobScrapeLog.started_at)
    ).limit(limit).all()

    return logs


# Helper functions

def calculate_match_score(user: User, job: ScrapedJob) -> float:
    """Calculate match score between user and job."""
    score = 50.0  # Base score

    # Skill match
    if job.skills_required and user.skills:
        user_skill_names = {s.name.lower() for s in user.skills}
        job_skills = set(s.lower() for s in job.skills_required)

        if job_skills:
            skill_overlap = len(user_skill_names & job_skills)
            skill_match_pct = skill_overlap / len(job_skills) * 100
            score += skill_match_pct * 0.3  # 30% weight

    # Experience level match
    if job.experience_level and user.tier:
        tier_map = {
            'apprentice': 'entry',
            'associate': 'intermediate',
            'professional': 'intermediate',
            'expert': 'expert',
            'master': 'expert',
            'legend': 'expert'
        }
        user_exp = tier_map.get(user.tier.value, 'any')
        if job.experience_level == user_exp or job.experience_level == 'any':
            score += 10

    # Budget alignment (if user has hourly rate preference)
    if job.budget_min and hasattr(user, 'hourly_rate'):
        if user.hourly_rate:
            if job.budget_min <= user.hourly_rate <= (job.budget_max or job.budget_min * 2):
                score += 10

    return min(round(score, 1), 100.0)


def is_job_saved(db: Session, user_id: int, job_id: int) -> bool:
    """Check if a job is saved by user."""
    match = db.query(ScrapedJobMatch).filter(
        ScrapedJobMatch.scraped_job_id == job_id,
        ScrapedJobMatch.user_id == user_id,
        ScrapedJobMatch.is_saved == True
    ).first()
    return match is not None
