"""Device management models for mobile push notifications."""
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class UserDevice(Base):
    """User device model for push notifications."""
    __tablename__ = "user_devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Device info
    device_token = Column(String(500), unique=True, nullable=False, index=True)
    device_type = Column(String(20), nullable=False)  # ios, android, web
    device_name = Column(String(100), nullable=True)
    device_model = Column(String(100), nullable=True)
    os_version = Column(String(50), nullable=True)
    app_version = Column(String(20), nullable=True)

    # Push notification settings
    push_enabled = Column(Boolean, default=True)
    notification_settings = Column(JSON, default={
        "job_matches": True,
        "application_updates": True,
        "messages": True,
        "payments": True,
        "course_reminders": True,
        "marketing": False,
    })

    # Status
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime, default=func.now())

    # Timestamps
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", backref="devices")

    def __repr__(self):
        return f"<UserDevice {self.device_type} {self.device_name}>"


class PushNotification(Base):
    """Push notification log model."""
    __tablename__ = "push_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("user_devices.id"), nullable=True)

    # Notification content
    title = Column(String(200), nullable=False)
    body = Column(String(1000), nullable=False)
    data = Column(JSON, default={})  # Custom data payload
    image_url = Column(String(500), nullable=True)
    action_url = Column(String(500), nullable=True)

    # Status
    status = Column(String(20), default="pending")  # pending, sent, delivered, failed
    error_message = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=func.now())
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", backref="push_notifications")
    device = relationship("UserDevice")


class MobileSession(Base):
    """Mobile session tracking for analytics."""
    __tablename__ = "mobile_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("user_devices.id"), nullable=True)

    # Session data
    session_id = Column(String(100), unique=True, nullable=False, index=True)
    start_time = Column(DateTime, default=func.now())
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)

    # Screen tracking
    screens_viewed = Column(JSON, default=[])
    actions_taken = Column(Integer, default=0)

    # Metadata
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    # Relationships
    user = relationship("User", backref="mobile_sessions")
    device = relationship("UserDevice")
