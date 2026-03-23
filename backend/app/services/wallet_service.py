"""Wallet service for managing user and group funds."""
import os
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum

from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models import User, Guild
from app.models.wallet import Wallet, Transaction, WalletType, TransactionType, TransactionStatus
from app.services.paystack import paystack_service, convert_from_smallest_unit


class WalletService:
    """Service for managing user wallets and transactions."""

    # Transaction fees (percentage)
    PLATFORM_FEE_PERCENT = Decimal("2.5")  # 2.5% platform fee
    WITHDRAWAL_FEE_FLAT = Decimal("100.00")  # ₦100 flat withdrawal fee
    GUILD_FEE_PERCENT = Decimal("1.0")  # 1% guild fee (for guild wallets)

    def __init__(self):
        self.currency = "NGN"  # Default currency

    def create_wallet(
        self,
        db: Session,
        owner_type: WalletType,
        owner_id: int,
        currency: str = "NGN",
        is_group: bool = False,
        guild_id: Optional[int] = None,
    ) -> Wallet:
        """Create a new wallet."""
        wallet = Wallet(
            id=str(uuid.uuid4()),
            owner_type=owner_type,
            owner_id=owner_id,
            currency=currency,
            balance=0,
            is_group=is_group,
            guild_id=guild_id,
            status="active",
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
        return wallet

    def get_or_create_wallet(
        self,
        db: Session,
        owner_type: WalletType,
        owner_id: int,
        currency: str = "NGN",
    ) -> Wallet:
        """Get existing wallet or create new one."""
        wallet = db.query(Wallet).filter(
            and_(
                Wallet.owner_type == owner_type,
                Wallet.owner_id == owner_id,
                Wallet.currency == currency,
                Wallet.status == "active",
            )
        ).first()

        if not wallet:
            wallet = self.create_wallet(db, owner_type, owner_id, currency)

        return wallet

    def get_balance(self, db: Session, wallet_id: str) -> Dict[str, Any]:
        """Get wallet balance details."""
        wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()

        if not wallet:
            return {"status": False, "message": "Wallet not found"}

        # Calculate available vs pending
        pending_deposits = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.wallet_id == wallet_id,
                Transaction.type == TransactionType.DEPOSIT,
                Transaction.status == TransactionStatus.PENDING,
            )
        ).scalar() or 0

        pending_withdrawals = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.wallet_id == wallet_id,
                Transaction.type == TransactionType.WITHDRAWAL,
                Transaction.status == TransactionStatus.PENDING,
            )
        ).scalar() or 0

        return {
            "status": True,
            "wallet_id": wallet_id,
            "available_balance": convert_from_smallest_unit(wallet.balance, wallet.currency),
            "pending_deposits": convert_from_smallest_unit(pending_deposits, wallet.currency),
            "pending_withdrawals": convert_from_smallest_unit(pending_withdrawals, wallet.currency),
            "total_balance": convert_from_smallest_unit(
                wallet.balance + pending_deposits - pending_withdrawals,
                wallet.currency
            ),
            "currency": wallet.currency,
        }

    def deposit(
        self,
        db: Session,
        wallet_id: str,
        amount: int,  # Amount in kobo
        source: str,
        reference: str,
        metadata: Optional[Dict] = None,
    ) -> Transaction:
        """Process a deposit (from Paystack webhook)."""
        wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()

        if not wallet:
            raise ValueError("Wallet not found")

        # Create transaction record
        transaction = Transaction(
            id=str(uuid.uuid4()),
            wallet_id=wallet_id,
            type=TransactionType.DEPOSIT,
            status=TransactionStatus.PENDING,
            amount=amount,
            currency=wallet.currency,
            source=source,
            reference=reference,
            metadata=metadata or {},
        )
        db.add(transaction)
        db.commit()

        # Verify with Paystack
        verification = paystack_service.verify_transaction(reference)

        if verification.get("status") and verification.get("data", {}).get("status") == "success":
            # Update transaction and wallet
            transaction.status = TransactionStatus.COMPLETED
            transaction.completed_at = datetime.utcnow()
            transaction.provider_response = verification

            wallet.balance += amount
            wallet.updated_at = datetime.utcnow()

            db.commit()

            # If group wallet, distribute to members
            if wallet.is_group and wallet.guild_id:
                self._distribute_group_funds(db, wallet, amount)

        else:
            transaction.status = TransactionStatus.FAILED
            transaction.error_message = verification.get("message", "Verification failed")
            db.commit()

        return transaction

    def initiate_withdrawal(
        self,
        db: Session,
        wallet_id: str,
        amount: int,  # Amount in kobo
        bank_account: Dict[str, str],
    ) -> Dict[str, Any]:
        """Initiate a withdrawal to bank account."""
        wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()

        if not wallet:
            return {"status": False, "message": "Wallet not found"}

        if wallet.balance < amount:
            return {"status": False, "message": "Insufficient balance"}

        # Calculate fees
        amount_decimal = Decimal(amount)
        platform_fee = (amount_decimal * self.PLATFORM_FEE_PERCENT / 100).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        total_deduction = amount + int(platform_fee * 100) + int(self.WITHDRAWAL_FEE_FLAT * 100)

        if wallet.balance < total_deduction:
            return {
                "status": False,
                "message": f"Insufficient balance (includes ₦{self.WITHDRAWAL_FEE_FLAT} fee + {self.PLATFORM_FEE_PERCENT}% platform fee)",
            }

        # Create transfer recipient if not exists
        recipient_result = paystack_service.create_transfer_recipient(
            account_type="nuban",
            account_number=bank_account["account_number"],
            bank_code=bank_account["bank_code"],
            name=bank_account["account_name"],
            currency=wallet.currency,
        )

        if not recipient_result.get("status"):
            return {
                "status": False,
                "message": f"Failed to create transfer recipient: {recipient_result.get('message')}",
            }

        recipient_code = recipient_result["data"]["recipient_code"]

        # Create pending transaction
        reference = f"WD_{wallet_id}_{int(datetime.utcnow().timestamp())}"
        transaction = Transaction(
            id=str(uuid.uuid4()),
            wallet_id=wallet_id,
            type=TransactionType.WITHDRAWAL,
            status=TransactionStatus.PENDING,
            amount=-amount,
            currency=wallet.currency,
            source="bank_transfer",
            destination=f"{bank_account['bank_name']} - {bank_account['account_number'][-4:]}",
            reference=reference,
            metadata={
                "bank_code": bank_account["bank_code"],
                "recipient_code": recipient_code,
                "platform_fee": str(platform_fee),
                "withdrawal_fee": str(self.WITHDRAWAL_FEE_FLAT),
            },
        )
        db.add(transaction)

        # Reserve funds
        wallet.balance -= total_deduction
        wallet.updated_at = datetime.utcnow()
        db.commit()

        # Initiate transfer via Paystack
        transfer_result = paystack_service.initiate_transfer(
            amount=amount,
            recipient_code=recipient_code,
            reference=reference,
            reason="Maiki Withdrawal",
        )

        if transfer_result.get("status"):
            transaction.provider_reference = transfer_result["data"].get("transfer_code")
            transaction.status = TransactionStatus.PROCESSING
            db.commit()

            return {
                "status": True,
                "transaction_id": transaction.id,
                "reference": reference,
                "amount": convert_from_smallest_unit(amount, wallet.currency),
                "fees": {
                    "platform_fee": float(platform_fee),
                    "withdrawal_fee": float(self.WITHDRAWAL_FEE_FLAT),
                },
                "message": "Withdrawal initiated successfully",
            }
        else:
            # Refund on failure
            wallet.balance += total_deduction
            transaction.status = TransactionStatus.FAILED
            transaction.error_message = transfer_result.get("message")
            db.commit()

            return {
                "status": False,
                "message": f"Transfer initiation failed: {transfer_result.get('message')}",
            }

    def create_group_wallet(
        self,
        db: Session,
        guild_id: int,
        name: str,
        description: str,
        created_by: int,
        currency: str = "NGN",
    ) -> Dict[str, Any]:
        """Create a shared wallet for a guild."""
        guild = db.query(Guild).filter(Guild.id == guild_id).first()

        if not guild:
            return {"status": False, "message": "Guild not found"}

        # Check if guild already has a wallet
        existing = db.query(Wallet).filter(
            and_(
                Wallet.guild_id == guild_id,
                Wallet.is_group == True,
                Wallet.status == "active",
            )
        ).first()

        if existing:
            return {"status": False, "message": "Guild already has a wallet"}

        wallet = self.create_wallet(
            db=db,
            owner_type=WalletType.GUILD,
            owner_id=guild_id,
            currency=currency,
            is_group=True,
            guild_id=guild_id,
        )

        # Update wallet with group details
        wallet.name = name
        wallet.description = description
        wallet.created_by = created_by

        db.commit()

        return {
            "status": True,
            "wallet_id": wallet.id,
            "name": name,
            "message": "Group wallet created successfully",
        }

    def _distribute_group_funds(
        self,
        db: Session,
        wallet: Wallet,
        amount: int,
    ) -> None:
        """Distribute group wallet funds to members."""
        from app.models.guild import GuildMember

        # Get guild members with wallet shares
        members = db.query(GuildMember).filter(
            GuildMember.guild_id == wallet.guild_id,
            GuildMember.status == "active",
        ).all()

        if not members:
            return

        # Calculate distribution (equal split by default)
        share = amount // len(members)

        for member in members:
            member_wallet = self.get_or_create_wallet(
                db,
                WalletType.USER,
                member.user_id,
                wallet.currency,
            )

            # Create distribution transaction
            transaction = Transaction(
                id=str(uuid.uuid4()),
                wallet_id=member_wallet.id,
                type=TransactionType.GUILD_DISTRIBUTION,
                status=TransactionStatus.COMPLETED,
                amount=share,
                currency=wallet.currency,
                source=f"guild:{wallet.guild_id}",
                reference=f"GUILD_DIST_{wallet.id}_{member.user_id}_{int(datetime.utcnow().timestamp())}",
                completed_at=datetime.utcnow(),
            )
            db.add(transaction)

            member_wallet.balance += share
            member_wallet.updated_at = datetime.utcnow()

        db.commit()

    def transfer_between_wallets(
        self,
        db: Session,
        from_wallet_id: str,
        to_wallet_id: str,
        amount: int,
        description: str = "",
    ) -> Dict[str, Any]:
        """Transfer funds between wallets (e.g., peer-to-peer)."""
        from_wallet = db.query(Wallet).filter(Wallet.id == from_wallet_id).first()
        to_wallet = db.query(Wallet).filter(Wallet.id == to_wallet_id).first()

        if not from_wallet or not to_wallet:
            return {"status": False, "message": "Wallet not found"}

        if from_wallet.currency != to_wallet.currency:
            return {"status": False, "message": "Currency mismatch"}

        if from_wallet.balance < amount:
            return {"status": False, "message": "Insufficient balance"}

        reference = f"P2P_{from_wallet_id[:8]}_{to_wallet_id[:8]}_{int(datetime.utcnow().timestamp())}"

        # Deduct from sender
        from_wallet.balance -= amount
        from_wallet.updated_at = datetime.utcnow()

        sender_tx = Transaction(
            id=str(uuid.uuid4()),
            wallet_id=from_wallet_id,
            type=TransactionType.TRANSFER_OUT,
            status=TransactionStatus.COMPLETED,
            amount=-amount,
            currency=from_wallet.currency,
            source="p2p_transfer",
            destination=to_wallet_id,
            reference=reference,
            description=description,
            completed_at=datetime.utcnow(),
        )
        db.add(sender_tx)

        # Add to recipient
        to_wallet.balance += amount
        to_wallet.updated_at = datetime.utcnow()

        recipient_tx = Transaction(
            id=str(uuid.uuid4()),
            wallet_id=to_wallet_id,
            type=TransactionType.TRANSFER_IN,
            status=TransactionStatus.COMPLETED,
            amount=amount,
            currency=to_wallet.currency,
            source="p2p_transfer",
            destination=from_wallet_id,
            reference=reference,
            description=description,
            completed_at=datetime.utcnow(),
        )
        db.add(recipient_tx)

        db.commit()

        return {
            "status": True,
            "transaction_id": sender_tx.id,
            "reference": reference,
            "amount": convert_from_smallest_unit(amount, from_wallet.currency),
            "from_wallet": from_wallet_id,
            "to_wallet": to_wallet_id,
        }

    def get_transaction_history(
        self,
        db: Session,
        wallet_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict]:
        """Get transaction history for a wallet."""
        transactions = db.query(Transaction).filter(
            Transaction.wallet_id == wallet_id
        ).order_by(
            Transaction.created_at.desc()
        ).offset(offset).limit(limit).all()

        return [
            {
                "id": tx.id,
                "type": tx.type.value,
                "status": tx.status.value,
                "amount": convert_from_smallest_unit(abs(tx.amount), tx.currency),
                "direction": "credit" if tx.amount > 0 else "debit",
                "source": tx.source,
                "destination": tx.destination,
                "reference": tx.reference,
                "description": tx.description,
                "created_at": tx.created_at.isoformat(),
                "completed_at": tx.completed_at.isoformat() if tx.completed_at else None,
            }
            for tx in transactions
        ]

    def get_wallet_stats(self, db: Session, wallet_id: str) -> Dict[str, Any]:
        """Get wallet statistics."""
        # Total incoming
        total_in = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.wallet_id == wallet_id,
                Transaction.amount > 0,
                Transaction.status == TransactionStatus.COMPLETED,
            )
        ).scalar() or 0

        # Total outgoing
        total_out = db.query(func.sum(func.abs(Transaction.amount))).filter(
            and_(
                Transaction.wallet_id == wallet_id,
                Transaction.amount < 0,
                Transaction.status == TransactionStatus.COMPLETED,
            )
        ).scalar() or 0

        # Transaction counts by type
        type_counts = db.query(
            Transaction.type,
            func.count(Transaction.id),
            func.sum(Transaction.amount),
        ).filter(
            Transaction.wallet_id == wallet_id
        ).group_by(Transaction.type).all()

        wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()

        return {
            "wallet_id": wallet_id,
            "total_incoming": convert_from_smallest_unit(total_in, wallet.currency) if wallet else 0,
            "total_outgoing": convert_from_smallest_unit(total_out, wallet.currency) if wallet else 0,
            "net_flow": convert_from_smallest_unit(total_in - total_out, wallet.currency) if wallet else 0,
            "transaction_counts": {
                t_type.value: {"count": count, "total": convert_from_smallest_unit(total, wallet.currency) if wallet else 0}
                for t_type, count, total in type_counts
            },
        }

    def freeze_wallet(self, db: Session, wallet_id: str, reason: str) -> bool:
        """Freeze a wallet (admin only)."""
        wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()

        if not wallet:
            return False

        wallet.status = "frozen"
        wallet.frozen_reason = reason
        wallet.frozen_at = datetime.utcnow()
        db.commit()

        return True

    def unfreeze_wallet(self, db: Session, wallet_id: str) -> bool:
        """Unfreeze a wallet (admin only)."""
        wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()

        if not wallet:
            return False

        wallet.status = "active"
        wallet.frozen_reason = None
        wallet.frozen_at = None
        db.commit()

        return True


# Singleton instance
wallet_service = WalletService()
