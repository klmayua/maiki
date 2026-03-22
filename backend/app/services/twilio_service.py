"""Twilio WhatsApp and SMS service."""
import os
from typing import Dict, Any, Optional
from datetime import datetime

from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException


class TwilioService:
    """Twilio API integration for WhatsApp and SMS."""

    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_whatsapp = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
        self.from_sms = os.getenv("TWILIO_PHONE_NUMBER")
        self.client = Client(self.account_sid, self.auth_token) if self.account_sid and self.auth_token else None

    def send_whatsapp(
        self,
        to: str,
        body: str,
        media_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send WhatsApp message."""
        if not self.client:
            return {"status": False, "message": "Twilio not configured"}

        try:
            # Ensure to number has whatsapp: prefix
            to_number = to if to.startswith("whatsapp:") else f"whatsapp:{to}"

            message_kwargs = {
                "from_": self.from_whatsapp,
                "body": body,
                "to": to_number,
            }
            if media_url:
                message_kwargs["media_url"] = [media_url]

            message = self.client.messages.create(**message_kwargs)

            return {
                "status": True,
                "message_sid": message.sid,
                "status": message.status,
            }

        except TwilioRestException as e:
            return {"status": False, "message": str(e), "code": e.code}
        except Exception as e:
            return {"status": False, "message": str(e)}

    def send_sms(
        self,
        to: str,
        body: str,
        media_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send SMS message."""
        if not self.client or not self.from_sms:
            return {"status": False, "message": "Twilio SMS not configured"}

        try:
            message_kwargs = {
                "from_": self.from_sms,
                "body": body,
                "to": to,
            }
            if media_url:
                message_kwargs["media_url"] = [media_url]

            message = self.client.messages.create(**message_kwargs)

            return {
                "status": True,
                "message_sid": message.sid,
                "status": message.status,
            }

        except TwilioRestException as e:
            return {"status": False, "message": str(e), "code": e.code}
        except Exception as e:
            return {"status": False, "message": str(e)}

    def send_template_whatsapp(
        self,
        to: str,
        template_name: str,
        language: str = "en",
        components: Optional[list] = None,
    ) -> Dict[str, Any]:
        """Send WhatsApp template message (requires approved template)."""
        if not self.client:
            return {"status": False, "message": "Twilio not configured"}

        try:
            to_number = to if to.startswith("whatsapp:") else f"whatsapp:{to}"

            content_variables = {}
            if components:
                for i, component in enumerate(components):
                    content_variables[str(i + 1)] = component

            message = self.client.messages.create(
                from_=self.from_whatsapp,
                content_sid=template_name,
                content_variables=content_variables,
                to=to_number,
            )

            return {
                "status": True,
                "message_sid": message.sid,
            }

        except TwilioRestException as e:
            return {"status": False, "message": str(e), "code": e.code}
        except Exception as e:
            return {"status": False, "message": str(e)}

    def verify_whatsapp_number(self, phone_number: str) -> Dict[str, Any]:
        """Check if a number has WhatsApp."""
        if not self.client:
            return {"status": False, "message": "Twilio not configured"}

        try:
            lookup = self.client.lookups.v2.phone_numbers(phone_number).fetch(fields="whatsapp")
            return {
                "status": True,
                "has_whatsapp": lookup.whatsapp is not None,
                "whatsapp": lookup.whatsapp,
            }
        except Exception as e:
            return {"status": False, "message": str(e)}

    def get_message_status(self, message_sid: str) -> Dict[str, Any]:
        """Get message delivery status."""
        if not self.client:
            return {"status": False, "message": "Twilio not configured"}

        try:
            message = self.client.messages(message_sid).fetch()
            return {
                "status": True,
                "message_sid": message.sid,
                "delivery_status": message.status,
                "error_code": message.error_code,
                "error_message": message.error_message,
            }
        except Exception as e:
            return {"status": False, "message": str(e)}


class WhatsAppTemplate:
    """Pre-defined WhatsApp message templates."""

    @staticmethod
    def format_phone_number(phone: str, country_code: str = "+234") -> str:
        """Format phone number for WhatsApp."""
        # Remove any non-numeric characters
        cleaned = "".join(c for c in phone if c.isdigit())

        # Add country code if not present
        if not cleaned.startswith("+"):
            if cleaned.startswith("0"):
                cleaned = country_code + cleaned[1:]
            elif not cleaned.startswith(country_code[1:]):
                cleaned = country_code + cleaned

        return cleaned

    @staticmethod
    def welcome(name: str, app_url: str = "https://maiki.ai") -> str:
        """Welcome message for new users."""
        return f"""🎉 *Welcome to Maiki, {name}!*

Your journey into AI-human collaboration starts now.

✅ Complete your profile
✅ Take skill assessments
✅ Find your first gig

Open: {app_url}

Questions? Reply to this chat.
"""

    @staticmethod
    def job_alert(name: str, job_title: str, company: str, pay: str, apply_url: str) -> str:
        """Job alert notification."""
        return f"""🎯 *New Job Match, {name}!*

*{job_title}*
at {company}
💰 {pay}

Apply now: {apply_url}

_Jobs fill fast on Maiki!_
"""

    @staticmethod
    def application_accepted(name: str, job_title: str, employer: str) -> str:
        """Application accepted notification."""
        return f"""🎉 *Congratulations {name}!*

Your application for *{job_title}* at {employer} has been *ACCEPTED*!

🏆 You're hired!

Check your dashboard for next steps.
"""

    @staticmethod
    def payment_received(name: str, amount: str, job_title: str, balance: str) -> str:
        """Payment received notification."""
        return f"""💰 *Payment Received, {name}!*

*{amount}* has been deposited for:
_{job_title}_

Current balance: {balance}

Withdraw anytime from your dashboard.
"""

    @staticmethod
    def interview_reminder(name: str, job_title: str, employer: str, time: str, meeting_link: str) -> str:
        """Interview reminder."""
        return f"""📅 *Interview Reminder*

Hi {name},

You have an interview for *{job_title}* with {employer}

🕐 *{time}*
🔗 {meeting_link}

Good luck! 🍀
"""

    @staticmethod
    def deadline_reminder(name: str, task: str, deadline: str, hours_left: int) -> str:
        """Deadline reminder."""
        emoji = "⏰" if hours_left > 24 else "⚠️"
        return f"""{emoji} *Deadline Approaching*

Hi {name},

Your task *{task}* is due:
*{deadline}* ({hours_left} hours left)

Submit on time to maintain your rating!
"""

    @staticmethod
    def verification_code(code: str, expires_in: str = "10 minutes") -> str:
        """2FA verification code."""
        return f"""🔐 *Maiki Verification Code*

Your code: *{code}*

Valid for {expires_in}.

Never share this code with anyone.
"""

    @staticmethod
    def weekly_earnings(name: str, week_total: str, job_count: int, top_client: str) -> str:
        """Weekly earnings summary."""
        return f"""📊 *Weekly Earnings Report*

Hi {name},

This week: *{week_total}*
Completed: *{job_count} jobs*
Top client: {top_client}

Keep up the great work! 💪

View full report: https://maiki.ai/dashboard/earnings
"""


# Singleton instance
twilio_service = TwilioService()
