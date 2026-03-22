"""Wallet routes for managing funds."""
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.models import User
from app.models.wallet import WalletType
from app.services.wallet_service import wallet_service
from app.services.paystack import convert_to_smallest_unit

router = APIRouter(prefix="/wallets", tags=["wallets"])


@router.get("/me")
def get_my_wallet(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get my wallet details."""
    wallet = wallet_service.get_or_create_wallet(
        db,
        WalletType.USER,
        current_user.id,
        "NGN"
    )

    balance = wallet_service.get_balance(db, wallet.id)

    return {
        "wallet_id": wallet.id,
        "currency": wallet.currency,
        "balance": balance,
        "status": wallet.status,
        "created_at": wallet.created_at.isoformat(),
    }


@router.get("/me/balance")
def get_my_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get my wallet balance."""
    wallet = wallet_service.get_or_create_wallet(
        db,
        WalletType.USER,
        current_user.id,
        "NGN"
    )

    return wallet_service.get_balance(db, wallet.id)


@router.post("/withdraw")
def withdraw_funds(
    amount: float,
    bank_code: str,
    account_number: str,
    account_name: str,
    bank_name: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Withdraw funds to bank account."""
    wallet = wallet_service.get_or_create_wallet(
        db,
        WalletType.USER,
        current_user.id,
        "NGN"
    )

    # Convert amount to kobo
    amount_kobo = convert_to_smallest_unit(amount, wallet.currency)

    bank_account = {
        "bank_code": bank_code,
        "account_number": account_number,
        "account_name": account_name,
        "bank_name": bank_name or "Bank",
    }

    result = wallet_service.initiate_withdrawal(
        db,
        wallet.id,
        amount_kobo,
        bank_account
    )

    if not result.get("status"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Withdrawal failed"),
        )

    return result


@router.get("/me/transactions")
def get_transaction_history(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get my transaction history."""
    wallet = wallet_service.get_or_create_wallet(
        db,
        WalletType.USER,
        current_user.id,
        "NGN"
    )

    transactions = wallet_service.get_transaction_history(
        db,
        wallet.id,
        limit,
        offset
    )

    return {
        "wallet_id": wallet.id,
        "transactions": transactions,
        "count": len(transactions),
    }


@router.get("/me/stats")
def get_wallet_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get wallet statistics."""
    wallet = wallet_service.get_or_create_wallet(
        db,
        WalletType.USER,
        current_user.id,
        "NGN"
    )

    return wallet_service.get_wallet_stats(db, wallet.id)


@router.post("/transfer")
def transfer_to_user(
    recipient_email: str,
    amount: float,
    description: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Transfer funds to another user."""
    from app.models import User

    # Find recipient
    recipient = db.query(User).filter(User.email == recipient_email).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found",
        )

    if recipient.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot transfer to yourself",
        )

    # Get wallets
    sender_wallet = wallet_service.get_or_create_wallet(
        db,
        WalletType.USER,
        current_user.id,
        "NGN"
    )

    recipient_wallet = wallet_service.get_or_create_wallet(
        db,
        WalletType.USER,
        recipient.id,
        "NGN"
    )

    # Convert amount
    amount_kobo = convert_to_smallest_unit(amount, "NGN")

    result = wallet_service.transfer_between_wallets(
        db,
        sender_wallet.id,
        recipient_wallet.id,
        amount_kobo,
        description or f"Transfer from {current_user.full_name}"
    )

    if not result.get("status"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Transfer failed"),
        )

    return result


# Group Wallet Routes

@router.post("/group")
def create_group_wallet(
    guild_id: int,
    name: str,
    description: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a group wallet for a guild."""
    from app.models.guild import Guild, GuildMember

    # Check if user is guild admin
    membership = db.query(GuildMember).filter(
        GuildMember.guild_id == guild_id,
        GuildMember.user_id == current_user.id,
        GuildMember.role == "admin"
    ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only guild admins can create wallets",
        )

    result = wallet_service.create_group_wallet(
        db,
        guild_id,
        name,
        description,
        current_user.id,
        "NGN"
    )

    if not result.get("status"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to create wallet"),
        )

    return result


@router.get("/group/{guild_id}")
def get_group_wallet(
    guild_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get guild wallet details."""
    from app.models.guild import GuildMember

    # Check membership
    member = db.query(GuildMember).filter(
        GuildMember.guild_id == guild_id,
        GuildMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this guild",
        )

    from app.models.wallet import Wallet

    wallet = db.query(Wallet).filter(
        Wallet.guild_id == guild_id,
        Wallet.is_group == True
    ).first()

    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No wallet found for this guild",
        )

    balance = wallet_service.get_balance(db, wallet.id)

    return {
        "wallet_id": wallet.id,
        "name": wallet.name,
        "description": wallet.description,
        "currency": wallet.currency,
        "balance": balance,
        "status": wallet.status,
    }


# Admin routes

@router.post("/{wallet_id}/freeze")
def freeze_wallet(
    wallet_id: str,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Freeze a wallet (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    success = wallet_service.freeze_wallet(db, wallet_id, reason)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found",
        )

    return {"message": "Wallet frozen", "wallet_id": wallet_id}


@router.post("/{wallet_id}/unfreeze")
def unfreeze_wallet(
    wallet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Unfreeze a wallet (admin only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    success = wallet_service.unfreeze_wallet(db, wallet_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found",
        )

    return {"message": "Wallet unfrozen", "wallet_id": wallet_id}
