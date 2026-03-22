"""Message schemas."""
from datetime import datetime
from typing import Optional, List
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# ============= CONVERSATION SCHEMAS =============

class ConversationParticipant(BaseModel):
    """Conversation participant info."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    avatar_url: Optional[str]
    role: str = "member"


class ConversationBase(BaseModel):
    """Base conversation schema."""
    type: str = "direct"  # direct, job, team
    title: Optional[str] = None
    job_id: Optional[int] = None
    application_id: Optional[int] = None


class ConversationCreate(ConversationBase):
    """Create conversation request."""
    participant_ids: List[int]  # Other participants (not including creator)


class ConversationUpdate(BaseModel):
    """Update conversation request."""
    title: Optional[str] = Field(None, max_length=200)
    is_active: Optional[bool] = None


class ConversationInDB(ConversationBase):
    """Conversation in database."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime]


class ConversationResponse(ConversationInDB):
    """Conversation response with participants."""
    participants: List[ConversationParticipant] = []
    unread_count: int = 0
    last_message: Optional["MessageResponse"] = None


# ============= MESSAGE SCHEMAS =============

class MessageBase(BaseModel):
    """Base message schema."""
    type: str = "text"  # text, image, file, system
    content: str = Field(..., min_length=1, max_length=10000)


class MessageCreate(MessageBase):
    """Create message request."""
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None


class MessageUpdate(BaseModel):
    """Update message request."""
    content: str = Field(..., min_length=1, max_length=10000)


class MessageInDB(MessageBase):
    """Message in database."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    sender_id: int
    file_url: Optional[str]
    file_name: Optional[str]
    file_size: Optional[int]
    is_edited: bool
    edited_at: Optional[datetime]
    is_deleted: bool
    is_delivered: bool
    delivered_at: Optional[datetime]
    created_at: datetime


class MessageSender(BaseModel):
    """Message sender info."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    avatar_url: Optional[str]


class MessageResponse(MessageInDB):
    """Message response with sender."""
    sender: Optional[MessageSender] = None
    read_by: List[int] = []  # User IDs who have read this message


class MessageReadReceipt(BaseModel):
    """Read receipt schema."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    message_id: int
    user_id: int
    read_at: datetime


# ============= WEBSOCKET SCHEMAS =============

class WebSocketMessage(BaseModel):
    """WebSocket message format."""
    type: str  # message, typing, read, presence
    conversation_id: Optional[int] = None
    content: Optional[str] = None
    message_id: Optional[int] = None
    participants: List[int] = []


class TypingIndicator(BaseModel):
    """Typing indicator schema."""
    conversation_id: int
    user_id: int
    is_typing: bool


class ReadReceiptEvent(BaseModel):
    """Read receipt event schema."""
    conversation_id: int
    user_id: int
    message_id: int
    read_at: datetime
