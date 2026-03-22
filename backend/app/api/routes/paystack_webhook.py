"""Paystack webhook routes."""
from typing import Any
import hmac
import hashlib
import os

from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.orm import Session

from app.deps import get_db
from app.services.wallet_service import wallet_service

router = APIRouter(prefix="/webhooks/paystack", tags=["webhooks"])


@router.post("/")
async def paystack_webhook(
    request: Request,
    x_paystack_signature: str = Header(None),
    db: Session = Depends(get_db),
) -> Any:
    """Handle Paystack webhook events."""
    # Read raw body
    body = await request.body()

    # Verify signature
    secret_key = os.getenv("PAYSTACK_SECRET_KEY", "")
    expected_signature = hmac.new(
        secret_key.encode(),
        body,
        hashlib.sha512
    ).hexdigest()

    if x_paystack_signature != expected_signature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature",
        )

    # Parse payload
    payload = await request.json()
    event = payload.get("event")
    data = payload.get("data", {})

    # Handle different events
    if event == "charge.success":
        # Payment successful
        reference = data.get("reference")
        amount = data.get("amount")  # Already in kobo
        metadata = data.get("metadata", {})
        wallet_id = metadata.get("wallet_id")

        if wallet_id:
            # Process deposit
            wallet_service.deposit(
                db=db,
                wallet_id=wallet_id,
                amount=amount,
                source="paystack",
                reference=reference,
                metadata=data,
            )

    elif event == "transfer.success":
        # Transfer/withdrawal successful
        reference = data.get("reference")
        # Update transaction status

    elif event == "transfer.failed":
        # Transfer failed - refund wallet
        reference = data.get("reference")
        # Handle failed withdrawal

    return {"status": "success"}


@router.get("/banks/{country}")
def list_banks(
    country: str = "nigeria",
    db: Session = Depends(get_db),
) -> Any:
    """List supported banks."""
    from app.services.paystack import paystack_service

    result = paystack_service.list_banks(country)

    if not result.get("status"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message"),
        )

    return result


@router.get("/resolve-account")
def resolve_account(
    account_number: str,
    bank_code: str,
    db: Session = Depends(get_db),
) -> Any:
    """Resolve bank account details."""
    from app.services.paystack import paystack_service

    result = paystack_service.resolve_account(account_number, bank_code)

    if not result.get("status"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message"),
        )

    return result
