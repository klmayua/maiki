"""Payment routes."""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.deps import get_db, get_current_user
from app.models import Payment, User
from app.schemas import PaymentCreate, PaymentResponse

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/", response_model=List[PaymentResponse])
def list_my_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
) -> Any:
    """List my payments."""
    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(
        Payment.created_at.desc()
    ).offset(skip).limit(limit).all()

    return payments


@router.get("/stats")
def get_payment_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get payment statistics."""
    # Total earnings/revenue
    total = db.query(func.sum(Payment.amount)).filter(
        Payment.user_id == current_user.id,
        Payment.status == "released"
    ).scalar() or 0

    # Available balance (pending + held)
    balance = db.query(func.sum(Payment.amount)).filter(
        Payment.user_id == current_user.id,
        Payment.status.in_(["pending", "held"])
    ).scalar() or 0

    # This month
    from datetime import datetime
    from sqlalchemy import extract

    this_month = db.query(func.sum(Payment.amount)).filter(
        Payment.user_id == current_user.id,
        Payment.status == "released",
        extract('month', Payment.created_at) == datetime.now().month,
        extract('year', Payment.created_at) == datetime.now().year,
    ).scalar() or 0

    return {
        "total_earnings": total,
        "available_balance": balance,
        "this_month": this_month,
        "currency": "USD",
    }


@router.post("/withdraw")
def request_withdrawal(
    amount: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Request withdrawal (placeholder - integrate with Stripe/Bank)."""
    # Check balance
    available = db.query(func.sum(Payment.amount)).filter(
        Payment.user_id == current_user.id,
        Payment.status.in_(["pending", "held"])
    ).scalar() or 0

    if amount > available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient balance",
        )

    # Create withdrawal record
    withdrawal = Payment(
        user_id=current_user.id,
        amount=-amount,
        currency="USD",
        type="withdrawal",
        status="pending",
        description=f"Withdrawal to bank account",
    )

    db.add(withdrawal)
    db.commit()

    return {
        "message": "Withdrawal request submitted",
        "amount": amount,
        "status": "pending",
    }
