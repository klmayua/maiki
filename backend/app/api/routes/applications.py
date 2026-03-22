"""Application routes."""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user, require_va, require_client
from app.models import Application, Job, User
from app.schemas import (
    ApplicationCreate, ApplicationUpdate, ApplicationResponse
)

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("/", response_model=List[ApplicationResponse])
def list_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Any:
    """List my applications."""
    query = db.query(Application)

    if current_user.role == "va":
        query = query.filter(Application.applicant_id == current_user.id)
    elif current_user.role == "client":
        # Get applications for jobs posted by this client
        job_ids = db.query(Job.id).filter(Job.client_id == current_user.id).subquery()
        query = query.filter(Application.job_id.in_(job_ids))

    if status:
        query = query.filter(Application.status == status)

    query = query.order_by(Application.created_at.desc())
    applications = query.offset(skip).limit(limit).all()

    return applications


@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    *,
    db: Session = Depends(get_db),
    application_in: ApplicationCreate,
    current_user: User = Depends(require_va),
) -> Any:
    """Apply for a job (VAs only)."""
    # Check if job exists
    job = db.query(Job).filter(Job.id == application_in.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    # Check if job is open
    if job.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job is not open for applications",
        )

    # Check if user already applied
    existing = db.query(Application).filter(
        Application.job_id == application_in.job_id,
        Application.applicant_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this job",
        )

    # Check tier requirement
    if current_user.tier.value != job.required_tier:
        tier_levels = ["apprentice", "associate", "professional", "expert", "master", "legend"]
        user_level = tier_levels.index(current_user.tier.value)
        required_level = tier_levels.index(job.required_tier)

        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This job requires {job.required_tier} tier or higher",
            )

    # Create application
    application = Application(
        job_id=application_in.job_id,
        applicant_id=current_user.id,
        cover_letter=application_in.cover_letter,
        proposed_rate=application_in.proposed_rate,
        status="pending",
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get application by ID."""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Check authorization
    is_authorized = (
        application.applicant_id == current_user.id or
        application.job.client_id == current_user.id or
        current_user.is_superuser
    )

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this application",
        )

    return application


@router.put("/{application_id}")
def update_application(
    *,
    application_id: int,
    db: Session = Depends(get_db),
    application_update: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update application status (clients can accept/reject, VAs can withdraw)."""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Check authorization
    is_client = application.job.client_id == current_user.id
    is_applicant = application.applicant_id == current_user.id

    if not is_client and not is_applicant and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this application",
        )

    # Clients can update status to shortlisted, interview, accepted, rejected
    if is_client:
        allowed_statuses = ["shortlisted", "interview", "accepted", "rejected"]
        if application_update.status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Allowed: {allowed_statuses}",
            )

    # VAs can only withdraw (status = rejected with withdrawn flag)
    if is_applicant:
        if application_update.status != "withdrawn":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="VAs can only withdraw applications",
            )
        application_update.status = "rejected"

    application.status = application_update.status
    db.add(application)
    db.commit()

    return {"message": "Application updated successfully", "status": application.status}


@router.get("/job/{job_id}")
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_client),
    status: str = Query(None),
) -> Any:
    """Get applications for a specific job (clients only)."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found",
        )

    if job.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these applications",
        )

    query = db.query(Application).filter(Application.job_id == job_id)

    if status:
        query = query.filter(Application.status == status)

    applications = query.order_by(Application.created_at.desc()).all()

    return applications
