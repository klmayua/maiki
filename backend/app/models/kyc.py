"""KYC verification models."""
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class KYCStatus(str, enum.Enum):
    """KYC verification status."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class KYCProvider(str, enum.Enum):
    """KYC service providers."""
    SMILEID = "smileid"
    VERIFF = "veriff"


class KYCVerification(Base):
    """KYC verification attempt model."""
    __tablename__ = "kyc_verifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Provider details
    provider = Column(Enum(KYCProvider), nullable=False)
    provider_job_id = Column(String, nullable=False, unique=True, index=True)

    # Verification details
    status = Column(Enum(KYCStatus), default=KYCStatus.PENDING, nullable=False)
    country = Column(String, nullable=True)  # ISO country code
    id_type = Column(String, nullable=True)  # PASSPORT, ID_CARD, etc.

    # Response data
    provider_response = Column(JSON, default=dict)
    verification_data = Column(JSON, default=dict)  # Parsed verification results
    rejection_reason = Column(Text, nullable=True)

    # Document URLs (stored in Firebase)
    id_document_url = Column(String, nullable=True)
    selfie_url = Column(String, nullable=True)

    # Timestamps
    submitted_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="kyc_verifications")

    def __repr__(self):
        return f"<KYCVerification {self.id} {self.provider.value} {self.status.value}>"


class KYCDocument(Base):
    """KYC document storage model."""
    __tablename__ = "kyc_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verification_id = Column(Integer, ForeignKey("kyc_verifications.id"), nullable=True)

    # Document details
    document_type = Column(String, nullable=False)  # passport, id_card, drivers_license, etc.
    document_number = Column(String, nullable=True)  # Masked
    country_issued = Column(String, nullable=True)
    expiry_date = Column(DateTime, nullable=True)

    # Storage
    file_path = Column(String, nullable=False)  # Firebase Storage path
    file_hash = Column(String, nullable=True)  # SHA256 hash for integrity

    # Status
    is_verified = Column(Integer, default=0)
    verified_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<KYCDocument {self.id} {self.document_type}>"
