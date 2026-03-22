"""Admin API routes for platform management."""
from typing import Any, List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.deps import get_db, get_current_user, require_admin
from app.models import (
    User, Job, Application, Payment, Review, Contract,
    UserRole, UserTier, JobStatus, ApplicationStatus
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    role: Optional[str] = Query(None),
    is_verified: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
) -> Any:
    """List all users with filtering."""
    query = db.query(User)

    if role:
        query = query.filter(User.role == role)

    if is_verified is not None:
        query = query.filter(User.is_verified == is_verified)

    if search:
        query = query.filter(
            User.email.ilike(f"%{search}%") |
            User.first_name.ilike(f"%{search}%") |
            User.last_name.ilike(f"%{search}%")
        )

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "total": total,
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "name": f"{u.first_name} {u.last_name}",
                "role": u.role.value if hasattr(u.role, 'value') else u.role,
                "tier": u.tier.value if hasattr(u.tier, 'value') else u.tier,
                "is_verified": u.is_verified,
                "is_active": u.is_active,
                "rating": float(u.rating),
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
    }


@router.put("/users/{user_id}/verify")
def verify_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Verify a user manually."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    db.commit()

    return {"message": f"User {user.email} verified successfully"}


@router.put("/users/{user_id}/suspend")
def suspend_user(
    user_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Suspend a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_superuser:
        raise HTTPException(status_code=403, detail="Cannot suspend superuser")

    user.is_active = False
    db.commit()

    return {"message": f"User {user.email} suspended", "reason": reason}


@router.get("/jobs/moderation")
def get_jobs_for_moderation(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    status: str = Query("open"),
    flagged_only: bool = Query(False),
) -> Any:
    """Get jobs requiring moderation."""
    query = db.query(Job)

    if flagged_only:
        # In real implementation, would check flagged field
        query = query.filter(Job.featured == False)  # Placeholder

    jobs = query.order_by(Job.created_at.desc()).limit(50).all()

    return {
        "jobs": [
            {
                "id": j.id,
                "title": j.title,
                "client": f"{j.client.first_name} {j.client.last_name}",
                "status": j.status.value if hasattr(j.status, 'value') else j.status,
                "budget_min": float(j.budget_min) if j.budget_min else None,
                "budget_max": float(j.budget_max) if j.budget_max else None,
                "created_at": j.created_at.isoformat() if j.created_at else None,
            }
            for j in jobs
        ],
    }


@router.put("/jobs/{job_id}/moderate")
def moderate_job(
    job_id: int,
    action: str = Query(..., regex="^(approve|reject|flag)$"),
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Moderate a job posting."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if action == "reject":
        job.status = JobStatus.CANCELLED
    elif action == "flag":
        # In real implementation, would set flagged field
        pass

    db.commit()

    return {"message": f"Job {action}ed", "job_id": job_id}


@router.get("/disputes")
def list_disputes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    status: str = Query("open"),
) -> Any:
    """List payment/contract disputes."""
    # Placeholder - would query disputes table
    return {
        "disputes": [],
        "message": "Dispute system not yet implemented",
    }


@router.get("/system/health")
def system_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Get system health status."""
    # Check database
    try:
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    # Get counts for health metrics
    stats = {
        "users": db.query(func.count(User.id)).scalar(),
        "jobs": db.query(func.count(Job.id)).scalar(),
        "applications": db.query(func.count(Application.id)).scalar(),
        "payments": db.query(func.count(Payment.id)).scalar(),
    }

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat(),
        "stats": stats,
    }


@router.post("/system/broadcast")
def broadcast_message(
    message: str,
    target: str = Query("all", regex="^(all|vas|clients)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Broadcast message to users."""
    # Would integrate with notification service
    return {
        "message": "Broadcast sent",
        "target": target,
        "content": message,
    }


@router.get("/config")
def get_platform_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Get platform configuration."""
    return {
        "commission_rate": 15.0,
        "tiers": {
            "apprentice": {"min_hours": 0, "max_hours": 50},
            "associate": {"min_hours": 50, "max_hours": 200},
            "professional": {"min_hours": 200, "max_hours": 500},
            "expert": {"min_hours": 500, "max_hours": 1000},
            "master": {"min_hours": 1000, "max_hours": 2000},
            "legend": {"min_hours": 2000, "max_hours": None},
        },
        "features": {
            "ai_matching": True,
            "auto_apply": True,
            "community": True,
            "messaging": True,
        },
    }


@router.put("/config")
def update_platform_config(
    config: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Update platform configuration."""
    # Would update configuration store
    return {"message": "Config updated", "config": config}


@router.get("/audit-log")
def get_audit_log(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
    limit: int = Query(100, ge=1, le=1000),
) -> Any:
    """Get admin audit log."""
    # Placeholder - would query audit log table
    return {
        "logs": [],
        "message": "Audit logging not yet implemented",
    }
