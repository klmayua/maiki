"""Wallet and transaction models."""
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class WalletType(str, PyEnum):
    """Wallet owner types."""
    USER = "user"
    GUILD = "guild"
    PROJECT = "project"


class TransactionType(str, PyEnum):
    """Transaction types."""
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER_IN = "transfer_in"
    TRANSFER_OUT = "transfer_out"
    PAYMENT = "payment"
    REFUND = "refund"
    FEE = "fee"
    GUILD_DISTRIBUTION = "guild_distribution"


class TransactionStatus(str, PyEnum):
    """Transaction statuses."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Wallet(Base):
    """Wallet model for storing funds."""
    __tablename__ = "wallets"

    id = Column(String, primary_key=True, index=True)
    owner_type = Column(Enum(WalletType), nullable=False)
    owner_id = Column(Integer, nullable=False, index=True)
    guild_id = Column(Integer, ForeignKey("guilds.id"), nullable=True)

    # Wallet details
    name = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    currency = Column(String, default="NGN", nullable=False)
    balance = Column(Integer, default=0, nullable=False)  # Stored in kobo/smallest unit

    # Group wallet settings
    is_group = Column(Integer, default=0)  # Boolean
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Status
    status = Column(String, default="active")  # active, frozen, closed
    frozen_reason = Column(Text, nullable=True)
    frozen_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    transactions = relationship("Transaction", back_populates="wallet", lazy="dynamic")
    guild = relationship("Guild", back_populates="wallet")

    def __repr__(self):
        return f"<Wallet {self.id} ({self.currency} {self.balance})>"


class Transaction(Base):
    """Transaction model for wallet activity."""
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    wallet_id = Column(String, ForeignKey("wallets.id"), nullable=False, index=True)

    # Transaction details
    type = Column(Enum(TransactionType), nullable=False)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING, nullable=False)
    amount = Column(Integer, nullable=False)  # In kobo (can be negative for debits)
    currency = Column(String, default="NGN", nullable=False)

    # Source/destination
    source = Column(String, nullable=True)  # e.g., "paystack", "guild:123", "p2p"
    destination = Column(String, nullable=True)  # e.g., bank account, other wallet

    # References
    reference = Column(String, unique=True, index=True, nullable=False)
    provider_reference = Column(String, nullable=True)  # Paystack transfer code

    # Additional info
    description = Column(Text, nullable=True)
    metadata = Column(JSON, default=dict)
    provider_response = Column(JSON, default=dict)
    error_message = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    wallet = relationship("Wallet", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction {self.id} {self.type.value} {self.amount}>"
