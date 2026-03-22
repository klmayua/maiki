"""Messaging models for real-time chat between users."""
import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Column, String, Integer, Text, DateTime, ForeignKey,
    Enum, Boolean, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base

if TYPE_CHECKING:
    from sqlalchemy.orm import Mapped


class ConversationType(str, enum.Enum):
    """Conversation types."""
    DIRECT = "direct"  # One-on-one chat
    JOB_RELATED = "job"  # Related to a specific job
    TEAM = "team"  # Team/group chat


class MessageType(str, enum.Enum):
    """Message types."""
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    SYSTEM = "system"  # System messages (e.g., "User joined")


class Conversation(Base):
    """Conversation model - represents a chat thread between users."""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(ConversationType), default=ConversationType.DIRECT)

    # For job-related conversations
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=True)

    # Metadata
    title = Column(String(200), nullable=True)  # For team/group chats
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_message_at = Column(DateTime, nullable=True)

    # Relationships
    job = relationship("Job", backref="conversations")
    application = relationship("Application", backref="conversations")
    participants = relationship("ConversationParticipant", back_populates="conversation")
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at.desc()")

    def __repr__(self):
        return f"<Conversation {self.id} type={self.type}>"


class ConversationParticipant(Base):
    """Links users to conversations with their specific settings."""
    __tablename__ = "conversation_participants"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Participant settings
    role = Column(String(50), default="member")  # member, admin, owner
    is_muted = Column(Boolean, default=False)
    last_read_at = Column(DateTime, nullable=True)  # Last time user read messages
    unread_count = Column(Integer, default=0)  # Cached unread count

    # Timestamps
    joined_at = Column(DateTime, default=func.now())

    # Relationships
    conversation = relationship("Conversation", back_populates="participants")
    user = relationship("User", backref="conversation_participants")

    # Unique constraint on conversation + user
    __table_args__ = (
        Index("idx_conversation_user", "conversation_id", "user_id", unique=True),
    )

    def __repr__(self):
        return f"<Participant conv={self.conversation_id} user={self.user_id}>"


class Message(Base):
    """Individual message in a conversation."""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Message content
    type = Column(Enum(MessageType), default=MessageType.TEXT)
    content = Column(Text, nullable=False)

    # For media messages
    file_url = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)  # in bytes

    # Status tracking
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)

    # Delivery status
    is_delivered = Column(Boolean, default=False)
    delivered_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=func.now(), index=True)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", backref="sent_messages")
    read_receipts = relationship("MessageReadReceipt", back_populates="message")

    def __repr__(self):
        return f"<Message {self.id} conv={self.conversation_id} sender={self.sender_id}>"


class MessageReadReceipt(Base):
    """Tracks when users read messages."""
    __tablename__ = "message_read_receipts"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    read_at = Column(DateTime, default=func.now())

    # Relationships
    message = relationship("Message", back_populates="read_receipts")
    user = relationship("User", backref="read_receipts")

    # Unique constraint
    __table_args__ = (
        Index("idx_message_user_receipt", "message_id", "user_id", unique=True),
    )

    def __repr__(self):
        return f"<ReadReceipt msg={self.message_id} user={self.user_id}>"
