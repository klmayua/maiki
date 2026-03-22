"""Pydantic schemas."""
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Literal

from pydantic import BaseModel, EmailStr, ConfigDict, Field


# ============= USER SCHEMAS =============

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    bio: Optional[str] = Field(None, max_length=2000)
    timezone: str = Field(default="UTC")
    country: Optional[str] = None
    city: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: Literal["va", "client"] = "va"


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=2000)
    hourly_rate_min: Optional[Decimal] = None
    hourly_rate_max: Optional[Decimal] = None
    country: Optional[str] = None
    city: Optional[str] = None


class UserInDB(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: str
    tier: str
    is_verified: bool
    is_active: bool
    hours_worked: Decimal
    rating: Decimal
    total_reviews: int
    avatar_url: Optional[str]
    subscription_tier: str
    created_at: datetime


class UserResponse(UserInDB):
    pass


class UserProfile(UserResponse):
    skills: List["SkillResponse"] = []
    certificates: List["CertificateResponse"] = []


# ============= AUTH SCHEMAS =============

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[int] = None
    type: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


# ============= JOB SCHEMAS =============

class JobBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=50)
    job_type: Literal["ongoing", "project", "full_time"] = "ongoing"
    budget_min: Optional[Decimal] = None
    budget_max: Optional[Decimal] = None
    hourly_rate: bool = True
    required_tier: str = "apprentice"
    hours_per_week: Optional[str] = None
    duration: Optional[str] = None
    location_type: Literal["remote", "onsite", "hybrid"] = "remote"
    timezone_preference: Optional[str] = None
    experience_level: Literal["entry", "intermediate", "expert", "any"] = "any"


class JobCreate(JobBase):
    skill_ids: List[int] = []


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = None
    budget_min: Optional[Decimal] = None
    budget_max: Optional[Decimal] = None


class JobInDB(JobBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    status: str
    featured: bool
    client_id: int
    created_at: datetime
    updated_at: datetime


class JobResponse(JobInDB):
    client: "UserResponse"
    required_skills: List["SkillResponse"] = []
    application_count: int = 0


class JobListParams(BaseModel):
    status: Optional[str] = "open"
    category: Optional[str] = None
    min_budget: Optional[Decimal] = None
    max_budget: Optional[Decimal] = None
    required_tier: Optional[str] = None
    location_type: Optional[str] = None
    search: Optional[str] = None
    page: int = 1
    per_page: int = 20


# ============= APPLICATION SCHEMAS =============

class ApplicationBase(BaseModel):
    cover_letter: Optional[str] = Field(None, max_length=5000)
    proposed_rate: Optional[Decimal] = None


class ApplicationCreate(ApplicationBase):
    job_id: int


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None


class ApplicationInDB(ApplicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    applicant_id: int
    status: str
    created_at: datetime


class ApplicationResponse(ApplicationInDB):
    job: Optional["JobResponse"] = None
    applicant: Optional["UserResponse"] = None


# ============= SKILL SCHEMAS =============

class SkillBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    category: str = Field(default="technical")


class SkillCreate(SkillBase):
    pass


class SkillInDB(SkillBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    blockchain_verified: bool


class SkillResponse(SkillInDB):
    pass


# ============= REVIEW SCHEMAS =============

class ReviewBase(BaseModel):
    rating: Decimal = Field(..., ge=1, le=5, decimal_places=2)
    title: Optional[str] = Field(None, max_length=200)
    content: str = Field(..., min_length=10, max_length=5000)
    communication: Optional[Decimal] = Field(None, ge=1, le=5, decimal_places=2)
    quality: Optional[Decimal] = Field(None, ge=1, le=5, decimal_places=2)
    timeliness: Optional[Decimal] = Field(None, ge=1, le=5, decimal_places=2)


class ReviewCreate(ReviewBase):
    reviewee_id: int
    contract_id: Optional[int] = None


class ReviewInDB(ReviewBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reviewer_id: int
    reviewee_id: int
    created_at: datetime


class ReviewResponse(ReviewInDB):
    reviewer: Optional["UserResponse"] = None


# ============= PAYMENT SCHEMAS =============

class PaymentBase(BaseModel):
    amount: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD")
    type: str
    description: Optional[str] = None


class PaymentCreate(PaymentBase):
    user_id: int
    contract_id: Optional[int] = None


class PaymentInDB(PaymentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: str
    created_at: datetime


class PaymentResponse(PaymentInDB):
    pass


# ============= COURSE SCHEMAS =============

class CourseBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=50)
    level: Literal["beginner", "intermediate", "advanced"] = "beginner"
    duration_hours: int = Field(default=0, ge=0)
    learning_path: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseInDB(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    is_premium: bool
    price: Decimal
    created_at: datetime


class CourseResponse(CourseInDB):
    pass


# ============= CERTIFICATE SCHEMAS =============

class CertificateBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    issuing_organization: str = Field(default="Maiki Academy")


class CertificateCreate(CertificateBase):
    pass


class CertificateInDB(CertificateBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    token_id: Optional[str]
    blockchain_address: Optional[str]
    is_verified: bool
    issued_at: datetime


class CertificateResponse(CertificateInDB):
    pass


# ============= GUILD SCHEMAS =============

class GuildBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=50, max_length=2000)
    category: str


class GuildCreate(GuildBase):
    pass


class GuildInDB(GuildBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    is_active: bool
    member_count: int
    created_at: datetime


class GuildResponse(GuildInDB):
    pass


# ============= MESSAGE SCHEMAS =============

class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    title: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime]


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    sender_id: int
    type: str
    content: str
    file_url: Optional[str]
    file_name: Optional[str]
    file_size: Optional[int]
    is_edited: bool
    is_deleted: bool
    created_at: datetime


class ConversationCreate(BaseModel):
    type: str = "direct"
    title: Optional[str] = None
    job_id: Optional[int] = None
    application_id: Optional[int] = None
    participant_ids: List[int]


class MessageCreate(BaseModel):
    type: str = "text"
    content: str = Field(..., min_length=1, max_length=10000)
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None


# ============= NOTIFICATION SCHEMAS =============

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    type: str
    is_read: bool
    action_url: Optional[str]
    created_at: datetime


# ============= STATISTICS SCHEMAS =============

class UserStats(BaseModel):
    total_hours_worked: Decimal
    total_earnings: Decimal
    completed_jobs: int
    active_jobs: int
    average_rating: Decimal
    response_rate: float


class PlatformStats(BaseModel):
    total_users: int
    total_vas: int
    total_clients: int
    total_jobs_posted: int
    total_applications: int
    total_payments_processed: Decimal
    average_hourly_rate: Decimal


class PaginatedResponse(BaseModel):
    """Generic paginated response."""
    items: List
    total: int
    page: int
    per_page: int
    pages: int


# Import additional schemas
from app.schemas.messages import (
    ConversationResponse as MsgConversationResponse,
    MessageResponse as MsgMessageResponse,
    ConversationCreate,
    ConversationParticipant,
    MessageCreate,
    MessageSender,
    WebSocketMessage,
)
