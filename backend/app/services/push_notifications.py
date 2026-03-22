"""Push notification service."""
import os
import json
from typing import List, Optional
from datetime import datetime

import requests
from sqlalchemy.orm import Session

from app.models.device import UserDevice, PushNotification
from app.core.config import settings


class PushNotificationService:
    """Service for sending push notifications via FCM."""

    def __init__(self):
        self.fcm_url = "https://fcm.googleapis.com/fcm/send"
        self.server_key = os.getenv("FCM_SERVER_KEY")

    async def send_to_device(
        self,
        db: Session,
        device: UserDevice,
        title: str,
        body: str,
        data: dict = None,
        image_url: str = None,
        action_url: str = None,
    ) -> bool:
        """Send push notification to a single device."""
        if not device.push_enabled:
            return False

        try:
            # Create notification record
            notification = PushNotification(
                user_id=device.user_id,
                device_id=device.id,
                title=title,
                body=body,
                data=data or {},
                image_url=image_url,
                action_url=action_url,
                status="pending",
            )
            db.add(notification)
            db.commit()

            # Prepare FCM payload
            payload = {
                "to": device.device_token,
                "notification": {
                    "title": title,
                    "body": body,
                    "icon": "/icons/icon-192x192.png",
                    "badge": "/icons/badge-72x72.png",
                    "image": image_url,
                    "click_action": action_url,
                },
                "data": data or {},
                "priority": "high",
            }

            # Send via FCM
            headers = {
                "Authorization": f"key={self.server_key}",
                "Content-Type": "application/json",
            }

            response = requests.post(
                self.fcm_url,
                headers=headers,
                json=payload,
                timeout=10,
            )

            if response.status_code == 200:
                notification.status = "sent"
                notification.sent_at = datetime.utcnow()
            else:
                notification.status = "failed"
                notification.error_message = response.text

            db.commit()
            return response.status_code == 200

        except Exception as e:
            notification.status = "failed"
            notification.error_message = str(e)
            db.commit()
            return False

    async def send_to_user(
        self,
        db: Session,
        user_id: int,
        title: str,
        body: str,
        data: dict = None,
        image_url: str = None,
        action_url: str = None,
    ) -> int:
        """Send push notification to all user devices."""
        devices = db.query(UserDevice).filter(
            UserDevice.user_id == user_id,
            UserDevice.is_active == True,
            UserDevice.push_enabled == True,
        ).all()

        sent_count = 0
        for device in devices:
            success = await self.send_to_device(
                db, device, title, body, data, image_url, action_url
            )
            if success:
                sent_count += 1

        return sent_count

    async def send_to_topic(
        self,
        db: Session,
        topic: str,
        title: str,
        body: str,
        data: dict = None,
    ) -> bool:
        """Send push notification to a topic (e.g., guild, job category)."""
        try:
            payload = {
                "to": f"/topics/{topic}",
                "notification": {
                    "title": title,
                    "body": body,
                },
                "data": data or {},
                "priority": "high",
            }

            headers = {
                "Authorization": f"key={self.server_key}",
                "Content-Type": "application/json",
            }

            response = requests.post(
                self.fcm_url,
                headers=headers,
                json=payload,
                timeout=10,
            )

            return response.status_code == 200

        except Exception as e:
            print(f"Failed to send topic notification: {e}")
            return False


class NotificationTemplate:
    """Pre-defined notification templates."""

    @staticmethod
    def job_match(job_title: str, company: str) -> dict:
        return {
            "title": f"New Job: {job_title}",
            "body": f"{company} is looking for someone like you!",
            "data": {"type": "job_match", "screen": "jobs"},
            "action_url": "/dashboard/jobs",
        }

    @staticmethod
    def application_accepted(job_title: str) -> dict:
        return {
            "title": "Application Accepted! 🎉",
            "body": f"Your application for {job_title} was accepted.",
            "data": {"type": "application_accepted", "screen": "applications"},
            "action_url": "/dashboard",
        }

    @staticmethod
    def new_message(sender_name: str) -> dict:
        return {
            "title": f"New message from {sender_name}",
            "body": "Tap to view the message",
            "data": {"type": "new_message", "screen": "messages"},
            "action_url": "/dashboard/messages",
        }

    @staticmethod
    def payment_received(amount: float, currency: str = "USD") -> dict:
        return {
            "title": "Payment Received 💰",
            "body": f"You received ${amount:,.2f}",
            "data": {"type": "payment", "screen": "earnings"},
            "action_url": "/dashboard/earnings",
        }

    @staticmethod
    def course_reminder(course_name: str) -> dict:
        return {
            "title": "Continue Learning 📚",
            "body": f"Don't forget to continue {course_name}",
            "data": {"type": "course_reminder", "screen": "learn"},
            "action_url": "/dashboard/learn",
        }


# Singleton instance
push_service = PushNotificationService()
