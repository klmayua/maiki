"""Job routes."""
from typing import Any, List
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.deps import get_db, get_current_user, require_client, require_va
from app.models import Job, User, Application, Skill
from app.schemas import (
    JobCreate, JobUpdate, JobResponse, JobListParams,
    PaginatedResponse
)
from app.core.config import settings

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/", response_model=List[JobResponse])
def list_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: str = Query("open"),
    category: str = Query(None),
    search: str = Query(None),
) -> Any:
    """List jobs with filters."""
    query = db.query(Job)

    if status:
        query = query.filter(Job.status == status)

    if search:
        query = query.filter(
            Job.title.ilike(f"%{search}%") |
            Job.description.ilike(f"%{search}%")
        )

    # Order by featured first, then newest
    query = query.order_by(Job.featured.desc(), Job.created_at.desc())

    jobs = query.offset(skip).limit(limit).all()

    # Add application count
    for job in jobs:
        job.application_count = db.query(Application).filter(
            Application.job_id == job.id
        ).count()

    return jobs


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    *,
    db: Session = Depends(get_db),
    job_in: JobCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create new job posting (clients and VAs can post)."""
    # Generate slug
    import re
    from slugify import slugify

    base_slug = slugify(job_in.title)
    slug = base_slug
    counter = 1

    while db.query(Job).filter(Job.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    # Create job - VAs can post jobs to hire subcontractors/build teams
    job = Job(
        title=job_in.title,
        slug=slug,
        description=job_in.description,
        job_type=job_in.job_type,
        budget_min=job_in.budget_min,
        budget_max=job_in.budget_max,
        hourly_rate=job_in.hourly_rate,
        required_tier=job_in.required_tier,
        hours_per_week=job_in.hours_per_week,
        duration=job_in.duration,
        location_type=job_in.location_type,
        timezone_preference=job_in.timezone_preference,
        experience_level=job_in.experience_level,
        client_id=current_user.id,
        status="open",
        posted_by_va=current_user.role in ['va', 'both'],  # Flag if posted by VA
    )

    # Add skills
    if job_in.skill_ids:
        skills = db.query(Skill).filter(Skill.id.in_(job_in.skill_ids)).all()
        job.required_skills = skills

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get job by ID."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Add application count
    job.application_count = db.query(Application).filter(
        Application.job_id == job.id
    ).count()

    return job


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    *,
    job_id: int,
    db: Session = Depends(get_db),
    job_update: JobUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update job posting."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Check ownership
    if job.client_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this job",
        )

    # Update fields
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Delete job posting."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if job.client_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this job",
        )

    db.delete(job)
    db.commit()

    return {"message": "Job deleted successfully"}


@router.get("/{job_id}/related", response_model=List[JobResponse])
def get_related_jobs(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(5, ge=1, le=20),
) -> Any:
    """Get related jobs based on skills."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Get skill IDs
    skill_ids = [s.id for s in job.required_skills]

    # Find jobs with similar skills
    from sqlalchemy import or_

    related = db.query(Job).filter(
        Job.id != job_id,
        Job.status == "open"
    ).limit(limit).all()

    return related
