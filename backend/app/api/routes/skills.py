"""Skill routes."""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user, get_current_active_superuser
from app.models import Skill
from app.schemas import SkillCreate, SkillResponse

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("/", response_model=List[SkillResponse])
def list_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    category: str = Query(None),
    search: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
) -> Any:
    """List all skills."""
    query = db.query(Skill)

    if category:
        query = query.filter(Skill.category == category)

    if search:
        query = query.filter(Skill.name.ilike(f"%{search}%"))

    skills = query.order_by(Skill.name).offset(skip).limit(limit).all()
    return skills


@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get skill by ID."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found",
        )
    return skill


@router.post("/", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    *,
    db: Session = Depends(get_db),
    skill_in: SkillCreate,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """Create new skill (admin only)."""
    from slugify import slugify

    # Check if skill exists
    if db.query(Skill).filter(Skill.name == skill_in.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill already exists",
        )

    skill = Skill(
        name=skill_in.name,
        slug=slugify(skill_in.name),
        description=skill_in.description,
        category=skill_in.category,
    )

    db.add(skill)
    db.commit()
    db.refresh(skill)

    return skill
