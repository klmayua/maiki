"""User routes."""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user, require_va, require_client, get_current_active_superuser
from app.models import User, Skill
from app.schemas import (
    UserResponse, UserUpdate, UserProfile, UserStats,
    PaginatedResponse
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get current user."""
    return current_user


@router.get("/me/profile", response_model=UserProfile)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get current user full profile."""
    # Load relationships
    db.refresh(current_user)
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    *,
    db: Session = Depends(get_db),
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update current user."""
    update_data = user_update.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/stats", response_model=UserStats)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get current user statistics."""
    # Calculate stats
    from sqlalchemy import func
    from app.models import Contract, Payment, Review

    # Total earnings
    total_earnings = db.query(func.sum(Payment.amount)).filter(
        Payment.user_id == current_user.id,
        Payment.status == "released"
    ).scalar() or 0

    # Completed jobs
    completed_jobs = db.query(Contract).filter(
        Contract.va_id == current_user.id,
    ).count()

    # Active jobs
    active_jobs = db.query(Contract).filter(
        Contract.va_id == current_user.id,
        Contract.is_active == True
    ).count()

    return {
        "total_hours_worked": current_user.hours_worked,
        "total_earnings": total_earnings,
        "completed_jobs": completed_jobs,
        "active_jobs": active_jobs,
        "average_rating": current_user.rating,
        "response_rate": 95.0,  # Placeholder
    }


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.get("/{user_id}/profile", response_model=UserProfile)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get user public profile."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.post("/me/skills/{skill_id}")
def add_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_va),
) -> Any:
    """Add skill to user profile."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )

    if skill in current_user.skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill already added",
        )

    current_user.skills.append(skill)
    db.commit()

    return {"message": "Skill added successfully"}


@router.delete("/me/skills/{skill_id}")
def remove_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Remove skill from user profile."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )

    if skill not in current_user.skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill not found in user profile",
        )

    current_user.skills.remove(skill)
    db.commit()

    return {"message": "Skill removed successfully"}


@router.get("/vas", response_model=List[UserResponse])
def list_vas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    tier: str = Query(None),
    search: str = Query(None),
) -> Any:
    """List virtual assistants (clients only)."""
    query = db.query(User).filter(User.role.in_(["va", "both"]))

    if tier:
        query = query.filter(User.tier == tier)

    if search:
        query = query.filter(
            User.first_name.ilike(f"%{search}%") |
            User.last_name.ilike(f"%{search}%") |
            User.bio.ilike(f"%{search}%")
        )

    users = query.offset(skip).limit(limit).all()
    return users
