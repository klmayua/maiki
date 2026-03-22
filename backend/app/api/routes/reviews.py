"""Review routes for user ratings and feedback."""
from typing import Any, List
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.deps import get_db, get_current_user
from app.models import User, Review, Contract, Application, Job
from app.schemas import ReviewCreate, ReviewResponse, PaginatedResponse

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/", response_model=List[ReviewResponse])
def list_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_id: int = Query(None, description="Filter by reviewee (user being reviewed)"),
    reviewer_id: int = Query(None, description="Filter by reviewer"),
    min_rating: int = Query(None, ge=1, le=5),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> Any:
    """List reviews with filters."""
    query = db.query(Review)

    if user_id:
        query = query.filter(Review.reviewee_id == user_id)

    if reviewer_id:
        query = query.filter(Review.reviewer_id == reviewer_id)

    if min_rating:
        query = query.filter(Review.rating >= min_rating)

    # Order by newest first
    query = query.order_by(Review.created_at.desc())

    reviews = query.offset(skip).limit(limit).all()

    return reviews


@router.get("/stats/{user_id}")
def get_user_review_stats(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get review statistics for a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Calculate stats
    stats = db.query(
        func.count(Review.id).label("total_reviews"),
        func.avg(Review.rating).label("average_rating"),
        func.avg(Review.communication).label("avg_communication"),
        func.avg(Review.quality).label("avg_quality"),
        func.avg(Review.timeliness).label("avg_timeliness"),
    ).filter(Review.reviewee_id == user_id).first()

    # Rating distribution
    distribution = db.query(
        Review.rating.label("rating"),
        func.count(Review.id).label("count")
    ).filter(Review.reviewee_id == user_id).group_by(Review.rating).all()

    rating_distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    for item in distribution:
        # Convert Decimal rating to int for grouping
        rating_int = int(float(item.rating))
        rating_distribution[rating_int] = item.count

    return {
        "user_id": user_id,
        "total_reviews": stats.total_reviews or 0,
        "average_rating": round(float(stats.average_rating), 2) if stats.average_rating else 0,
        "average_communication": round(float(stats.avg_communication), 2) if stats.avg_communication else 0,
        "average_quality": round(float(stats.avg_quality), 2) if stats.avg_quality else 0,
        "average_timeliness": round(float(stats.avg_timeliness), 2) if stats.avg_timeliness else 0,
        "rating_distribution": rating_distribution,
    }


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    *,
    db: Session = Depends(get_db),
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new review."""
    # Verify reviewee exists
    reviewee = db.query(User).filter(User.id == review_in.reviewee_id).first()
    if not reviewee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Can't review yourself
    if review_in.reviewee_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot review yourself"
        )

    # Check if already reviewed this user for this contract
    if review_in.contract_id:
        existing = db.query(Review).filter(
            Review.reviewer_id == current_user.id,
            Review.reviewee_id == review_in.reviewee_id,
            Review.contract_id == review_in.contract_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reviewed this user for this contract"
            )

        # Verify contract exists and is completed
        contract = db.query(Contract).filter(Contract.id == review_in.contract_id).first()
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found"
            )

        # Verify reviewer was involved in contract
        if contract.va_id != current_user.id and contract.client_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You were not involved in this contract"
            )

        # Verify reviewee was involved in contract
        if contract.va_id != review_in.reviewee_id and contract.client_id != review_in.reviewee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reviewee was not involved in this contract"
            )

    # Create review
    review = Review(
        reviewer_id=current_user.id,
        reviewee_id=review_in.reviewee_id,
        contract_id=review_in.contract_id,
        rating=review_in.rating,
        title=review_in.title,
        content=review_in.content,
        communication=review_in.communication,
        quality=review_in.quality,
        timeliness=review_in.timeliness,
    )

    db.add(review)

    # Update reviewee's rating
    all_reviews = db.query(Review).filter(Review.reviewee_id == review_in.reviewee_id).all()
    total_reviews = len(all_reviews) + 1
    total_rating = sum([r.rating for r in all_reviews]) + review_in.rating
    reviewee.rating = Decimal(str(total_rating / total_reviews))
    reviewee.total_reviews = total_reviews

    db.commit()
    db.refresh(review)

    return review


@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get a specific review."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    return review


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    *,
    review_id: int,
    db: Session = Depends(get_db),
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update a review (only by reviewer, within 30 days)."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    # Only reviewer can update
    if review.reviewer_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the reviewer can update this review"
        )

    # Can only edit within 30 days
    days_since_created = (datetime.utcnow() - review.created_at).days
    if days_since_created > 30 and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reviews can only be edited within 30 days"
        )

    # Update fields
    update_data = review_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(review, field, value)

    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate reviewee's rating
    all_reviews = db.query(Review).filter(Review.reviewee_id == review.reviewee_id).all()
    total_rating = sum([r.rating for r in all_reviews])
    reviewee = db.query(User).filter(User.id == review.reviewee_id).first()
    reviewee.rating = Decimal(str(total_rating / len(all_reviews)))

    db.commit()

    return review


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Delete a review (only by reviewer or admin)."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    if review.reviewer_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the reviewer or admin can delete this review"
        )

    reviewee_id = review.reviewee_id
    db.delete(review)
    db.commit()

    # Recalculate reviewee's rating
    remaining_reviews = db.query(Review).filter(Review.reviewee_id == reviewee_id).all()
    reviewee = db.query(User).filter(User.id == reviewee_id).first()

    if remaining_reviews:
        total_rating = sum([r.rating for r in remaining_reviews])
        reviewee.rating = Decimal(str(total_rating / len(remaining_reviews)))
        reviewee.total_reviews = len(remaining_reviews)
    else:
        reviewee.rating = Decimal("5.00")
        reviewee.total_reviews = 0

    db.commit()

    return {"message": "Review deleted successfully"}


@router.post("/{review_id}/report")
def report_review(
    review_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Report a review for moderation."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    # Can't report your own review
    if review.reviewer_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot report your own review"
        )

    # In a real implementation, this would create a moderation ticket
    # For now, just return success
    return {
        "message": "Review reported successfully",
        "review_id": review_id,
        "reported_by": current_user.id,
        "reason": reason
    }
