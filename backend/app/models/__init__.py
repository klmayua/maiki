"""Database models."""
import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey,
    Text, Enum, JSON, Numeric, Index, Table
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base

if TYPE_CHECKING:
    from sqlalchemy.orm import Mapped


# Association tables
user_skills = Table(
    "user_skills",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True),
)

guild_members = Table(
    "guild_members",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("guild_id", Integer, ForeignKey("guilds.id"), primary_key=True),
    Column("role", String(50), default="member"),
    Column("joined_at", DateTime, default=func.now()),
)

job_skills = Table(
    "job_skills",
    Base.metadata,
    Column("job_id", Integer, ForeignKey("jobs.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True),
)


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    VA = "va"  # Virtual Assistant
    CLIENT = "client"
    BOTH = "both"


class UserTier(str, enum.Enum):
    APPRENTICE = "apprentice"
    ASSOCIATE = "associate"
    PROFESSIONAL = "professional"
    EXPERT = "expert"
    MASTER = "master"
    LEGEND = "legend"


class JobStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    SHORTLISTED = "shortlisted"
    INTERVIEW = "interview"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    HELD = "held"  # In escrow
    RELEASED = "released"
    REFUNDED = "refunded"
    DISPUTED = "disputed"


class PaymentType(str, enum.Enum):
    JOB_PAYMENT = "job_payment"
    SUBSCRIPTION = "subscription"
    REFUND = "refund"
    WITHDRAWAL = "withdrawal"
    COMMISSION = "commission"


class User(Base):
    """User model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users

    # Profile
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    timezone = Column(String(50), default="UTC")
    phone = Column(String(20), nullable=True)

    # User Type
    role = Column(Enum(UserRole), default=UserRole.VA)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    # Tier System (for VAs)
    tier = Column(Enum(UserTier), default=UserTier.APPRENTICE)
    hours_worked = Column(Numeric(10, 2), default=0)
    rating = Column(Numeric(3, 2), default=5.00)
    total_reviews = Column(Integer, default=0)

    # Financial
    hourly_rate_min = Column(Numeric(10, 2), nullable=True)
    hourly_rate_max = Column(Numeric(10, 2), nullable=True)

    # Location
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)

    # Social/External
    google_id = Column(String(255), nullable=True, unique=True)
    linkedin_id = Column(String(255), nullable=True, unique=True)
    website = Column(String(500), nullable=True)

    # Stripe
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_account_id = Column(String(255), nullable=True)  # For Connect (VA payouts)

    # Subscription
    subscription_tier = Column(String(50), default="free")  # free, pro, agency
    subscription_expires_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_login = Column(DateTime, nullable=True)

    # Relationships
    skills = relationship("Skill", secondary=user_skills, back_populates="users")
    jobs_posted = relationship("Job", foreign_keys="Job.client_id", back_populates="client")
    applications = relationship("Application", back_populates="applicant")
    reviews_given = relationship("Review", foreign_keys="Review.reviewer_id", back_populates="reviewer")
    reviews_received = relationship("Review", foreign_keys="Review.reviewee_id", back_populates="reviewee")
    payments = relationship("Payment", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")
    course_progress = relationship("CourseProgress", back_populates="user")
    guilds = relationship("Guild", secondary=guild_members, back_populates="members")

    def __repr__(self):
        return f"<User {self.email}>"


class Skill(Base):
    """Skill model."""
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False)  # technical, soft, industry

    # For NFT skills
    nft_token_id = Column(String(255), nullable=True)
    blockchain_verified = Column(Boolean, default=False)

    created_at = Column(DateTime, default=func.now())

    # Relationships
    users = relationship("User", secondary=user_skills, back_populates="skills")
    jobs = relationship("Job", secondary=job_skills, back_populates="required_skills")


class Job(Base):
    """Job posting model."""
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(220), unique=True, nullable=False)
    description = Column(Text, nullable=False)

    # Job details
    status = Column(Enum(JobStatus), default=JobStatus.OPEN)
    job_type = Column(String(50), default="ongoing")  # ongoing, project, full_time

    # Budget
    budget_min = Column(Numeric(10, 2), nullable=True)
    budget_max = Column(Numeric(10, 2), nullable=True)
    hourly_rate = Column(Boolean, default=True)

    # Requirements
    required_tier = Column(Enum(UserTier), default=UserTier.APPRENTICE)
    hours_per_week = Column(String(50), nullable=True)
    duration = Column(String(100), nullable=True)  # e.g., "3 months"

    # Location
    location_type = Column(String(50), default="remote")  # remote, onsite, hybrid
    timezone_preference = Column(String(100), nullable=True)

    # Metadata
    experience_level = Column(String(50), default="any")  # entry, intermediate, expert
    featured = Column(Boolean, default=False)
    posted_by_va = Column(Boolean, default=False)  # True if posted by a VA (subcontracting)

    # Client
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    client = relationship("User", foreign_keys=[client_id], back_populates="jobs_posted")
    applications = relationship("Application", back_populates="job")
    required_skills = relationship("Skill", secondary=job_skills, back_populates="jobs")
    contracts = relationship("Contract", back_populates="job")

    def __repr__(self):
        return f"<Job {self.title}>"


class Application(Base):
    """Job application model."""
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Application details
    cover_letter = Column(Text, nullable=True)
    proposed_rate = Column(Numeric(10, 2), nullable=True)

    # Status
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    job = relationship("Job", back_populates="applications")
    applicant = relationship("User", back_populates="applications")


class Contract(Base):
    """Contract/work agreement model."""
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    va_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Contract details
    agreed_rate = Column(Numeric(10, 2), nullable=False)
    hours_per_week = Column(Integer, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=func.now())

    # Relationships
    job = relationship("Job", back_populates="contracts")
    payments = relationship("Payment", back_populates="contract")


class Payment(Base):
    """Payment transaction model."""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=True)

    # Payment details
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD")
    type = Column(Enum(PaymentType), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)

    # External IDs
    stripe_payment_intent_id = Column(String(255), nullable=True)
    blockchain_tx_hash = Column(String(255), nullable=True)

    # Metadata
    description = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    released_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="payments")
    contract = relationship("Contract", back_populates="payments")


class Review(Base):
    """Review/rating model."""
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=True)

    # Review content
    rating = Column(Numeric(3, 2), nullable=False)  # 1.00 to 5.00
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=False)

    # Categories
    communication = Column(Numeric(3, 2), nullable=True)
    quality = Column(Numeric(3, 2), nullable=True)
    timeliness = Column(Numeric(3, 2), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=func.now())

    # Relationships
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews_given")
    reviewee = relationship("User", foreign_keys=[reviewee_id], back_populates="reviews_received")


class Guild(Base):
    """VA Guild/DAO model."""
    __tablename__ = "guilds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(120), unique=True, nullable=False)
    description = Column(Text, nullable=False)

    # Guild details
    category = Column(String(50), nullable=False)  # industry, skill, geography
    is_active = Column(Boolean, default=True)

    # Governance
    governance_model = Column(String(50), default="democratic")  # democratic, meritocratic
    treasury_balance = Column(Numeric(15, 2), default=0)

    # Timestamps
    created_at = Column(DateTime, default=func.now())

    # Relationships
    members = relationship("User", secondary=guild_members, back_populates="guilds")


class Course(Base):
    """Learning course model."""
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(220), unique=True, nullable=False)
    description = Column(Text, nullable=False)

    # Course details
    level = Column(String(50), default="beginner")  # beginner, intermediate, advanced
    duration_hours = Column(Integer, default=0)
    is_premium = Column(Boolean, default=False)
    price = Column(Numeric(10, 2), default=0)

    # Content
    thumbnail_url = Column(String(500), nullable=True)
    learning_path = Column(String(100), nullable=True)  # e.g., "administrative", "social_media"

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    lessons = relationship("Lesson", back_populates="course")
    progress = relationship("CourseProgress", back_populates="course")


class Lesson(Base):
    """Course lesson model."""
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=True)
    order = Column(Integer, default=0)
    duration_minutes = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=func.now())

    # Relationships
    course = relationship("Course", back_populates="lessons")


class CourseProgress(Base):
    """User course progress model."""
    __tablename__ = "course_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)

    # Progress
    progress_percent = Column(Integer, default=0)
    completed_lessons = Column(JSON, default=list)
    is_completed = Column(Boolean, default=False)

    # Timestamps
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="course_progress")
    course = relationship("Course", back_populates="progress")


class Certificate(Base):
    """Skill certificate/NFT model."""
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Certificate details
    name = Column(String(200), nullable=False)
    issuing_organization = Column(String(200), default="Maiki Academy")

    # Blockchain
    token_id = Column(String(255), nullable=True)
    blockchain_address = Column(String(255), nullable=True)
    ipfs_hash = Column(String(255), nullable=True)

    # Verification
    is_verified = Column(Boolean, default=True)

    # Timestamps
    issued_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="certificates")


class Notification(Base):
    """User notification model."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Notification content
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # job, payment, review, system

    # Status
    is_read = Column(Boolean, default=False)

    # Links
    action_url = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=func.now())


class BlockchainRecord(Base):
    """Blockchain reputation record model."""
    __tablename__ = "blockchain_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Record details
    record_type = Column(String(50), nullable=False)  # work_completion, skill_verification, review
    data_hash = Column(String(255), nullable=False)  # IPFS hash or similar
    blockchain_tx_hash = Column(String(255), nullable=False)

    # Verification
    verified = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    recorded_at = Column(DateTime, nullable=True)  # When on-chain


# Create indexes for performance
Index("idx_jobs_status", Job.status)
Index("idx_jobs_client", Job.client_id)
Index("idx_applications_job", Application.job_id)
Index("idx_applications_applicant", Application.applicant_id)
Index("idx_payments_user", Payment.user_id)
Index("idx_reviews_reviewee", Review.reviewee_id)
Index("idx_notifications_user_unread", Notification.user_id, Notification.is_read)

# Import additional models
from app.models.wallet import Wallet, Transaction, WalletType, TransactionType, TransactionStatus
from app.models.kyc import KYCVerification, KYCDocument, KYCStatus, KYCProvider
from app.models.device import UserDevice, PushNotification
from app.models.message import Conversation, Message, ConversationParticipant, MessageReadReceipt, ConversationType, MessageType
from app.models.scraped_job import (
    ScrapedJob, ScrapedJobSource, AutoApplyStatus,
    ScrapedJobMatch, JobScrapeLog
)
