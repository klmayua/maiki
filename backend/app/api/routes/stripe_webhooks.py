"""Stripe webhook handlers."""
import stripe
from fastapi import APIRouter, Request, HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.core.config import settings
from app.deps import get_db
from app.services.stripe_service import StripeService, PaymentService

router = APIRouter(prefix="/stripe", tags=["stripe-webhooks"])


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhooks."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = StripeService.construct_webhook_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload"
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature"
        )

    # Process the event
    payment_service = PaymentService(db)
    payment = payment_service.handle_webhook(event)

    return {
        "status": "success",
        "event_type": event.type,
        "payment_id": payment.id if payment else None
    }


@router.get("/config")
async def get_stripe_config():
    """Get Stripe public configuration."""
    return {
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
    }
