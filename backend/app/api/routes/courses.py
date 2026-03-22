"""Course/Learning routes."""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.models import Course, CourseProgress, Certificate
from app.schemas import CourseResponse, CertificateResponse

router = APIRouter(prefix="/courses", tags=["learning"])


@router.get("/", response_model=List[CourseResponse])
def list_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    level: str = Query(None),
    learning_path: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Any:
    """List available courses."""
    query = db.query(Course)

    if level:
        query = query.filter(Course.level == level)

    if learning_path:
        query = query.filter(Course.learning_path == learning_path)

    courses = query.order_by(Course.created_at.desc()).offset(skip).limit(limit).all()
    return courses


@router.get("/my")
def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get my enrolled courses with progress."""
    progress = db.query(CourseProgress).filter(
        CourseProgress.user_id == current_user.id
    ).all()

    return [
        {
            "course_id": p.course_id,
            "title": p.course.title,
            "progress": p.progress_percent,
            "is_completed": p.is_completed,
            "started_at": p.started_at,
            "completed_at": p.completed_at,
        }
        for p in progress
    ]


@router.post("/{course_id}/enroll")
def enroll_in_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Enroll in a course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    # Check if already enrolled
    existing = db.query(CourseProgress).filter(
        CourseProgress.user_id == current_user.id,
        CourseProgress.course_id == course_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course",
        )

    progress = CourseProgress(
        user_id=current_user.id,
        course_id=course_id,
        progress_percent=0,
    )

    db.add(progress)
    db.commit()

    return {"message": "Successfully enrolled", "course_id": course_id}


@router.get("/certificates", response_model=List[CertificateResponse])
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get my certificates."""
    certificates = db.query(Certificate).filter(
        Certificate.user_id == current_user.id
    ).order_by(Certificate.issued_at.desc()).all()

    return certificates
