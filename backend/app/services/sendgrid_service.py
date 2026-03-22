"""SendGrid email service for transactional emails."""
import os
from typing import Dict, Any, Optional, List
from datetime import datetime

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent, Attachment, FileName, FileType, FileContent
import base64

from app.core.config import settings


class SendGridService:
    """SendGrid API integration for email delivery."""

    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("SENDGRID_FROM_EMAIL", "noreply@maiki.ai")
        self.from_name = os.getenv("SENDGRID_FROM_NAME", "Maiki")
        self.sg = SendGridAPIClient(self.api_key) if self.api_key else None

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
        reply_to: Optional[str] = None,
        attachments: Optional[List[Dict]] = None,
        categories: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Send a single email."""
        if not self.sg:
            return {"status": False, "message": "SendGrid not configured"}

        try:
            message = Mail(
                from_email=Email(from_email or self.from_email, from_name or self.from_name),
                to_emails=To(to_email),
                subject=subject,
                html_content=HtmlContent(html_content),
            )

            if text_content:
                message.content = Content("text/plain", text_content)

            if reply_to:
                message.reply_to = Email(reply_to)

            # Add attachments if provided
            if attachments:
                for attachment_data in attachments:
                    file_content = base64.b64encode(attachment_data["content"]).decode()
                    attachment = Attachment(
                        FileContent(file_content),
                        FileName(attachment_data["filename"]),
                        FileType(attachment_data.get("type", "application/pdf")),
                    )
                    message.add_attachment(attachment)

            # Add categories for tracking
            if categories:
                message.categories = categories

            response = self.sg.send(message)

            return {
                "status": response.status_code == 202,
                "status_code": response.status_code,
                "message_id": response.headers.get("X-Message-Id"),
            }

        except Exception as e:
            return {"status": False, "message": str(e)}

    def send_bulk_emails(
        self,
        recipients: List[Dict[str, str]],
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send bulk emails using SendGrid."""
        if not self.sg:
            return {"status": False, "message": "SendGrid not configured"}

        try:
            messages = []
            for recipient in recipients:
                message = Mail(
                    from_email=Email(self.from_email, self.from_name),
                    to_emails=To(recipient["email"], recipient.get("name")),
                    subject=subject,
                    html_content=HtmlContent(html_content),
                )
                if text_content:
                    message.content = Content("text/plain", text_content)
                messages.append(message)

            # Send in batches of 500 (SendGrid limit)
            batch_size = 500
            sent_count = 0
            failed_count = 0

            for i in range(0, len(messages), batch_size):
                batch = messages[i:i + batch_size]
                response = self.sg.send(batch)
                if response.status_code == 202:
                    sent_count += len(batch)
                else:
                    failed_count += len(batch)

            return {
                "status": True,
                "sent": sent_count,
                "failed": failed_count,
                "total": len(recipients),
            }

        except Exception as e:
            return {"status": False, "message": str(e)}

    def add_to_suppression_list(self, email: str) -> Dict[str, Any]:
        """Add email to suppression list (unsubscribe)."""
        if not self.sg:
            return {"status": False, "message": "SendGrid not configured"}

        try:
            response = self.sg.client.asm.suppressions._(email).post()
            return {"status": response.status_code == 201}
        except Exception as e:
            return {"status": False, "message": str(e)}

    def verify_email(self, email: str) -> Dict[str, Any]:
        """Verify email address using SendGrid validation."""
        if not self.sg:
            return {"status": False, "message": "SendGrid not configured"}

        try:
            response = self.sg.client.verified_senders.post(
                request_body={"email": email}
            )
            return {"status": response.status_code == 201}
        except Exception as e:
            return {"status": False, "message": str(e)}


class EmailTemplate:
    """Pre-defined email templates for Maiki."""

    BRAND_COLORS = {
        "primary": "#8B5CF6",  # Purple
        "accent": "#FBBF24",   # Gold
        "dark": "#0a0514",
        "light": "#ffffff",
    }

    @staticmethod
    def _base_template(content: str, preheader: str = "") -> str:
        """Base HTML email template with Maiki branding."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Maiki</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: {EmailTemplate.BRAND_COLORS['dark']}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background: linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 100%); border-radius: 16px; overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: {EmailTemplate.BRAND_COLORS['accent']};">Maiki</h1>
                                    <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.6);">Virtual Assistant Operating System</p>
                                    {f'<p style="display: none;">{preheader}</p>' if preheader else ''}
                                </td>
                            </tr>
                            <!-- Content -->
                            <tr>
                                <td style="padding: 40px;">
                                    {content}
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2);">
                                    <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                                        © 2026 Maiki. All rights reserved.<br>
                                        You're receiving this because you're a Maiki user.
                                    </p>
                                    <p style="margin: 16px 0 0; font-size: 12px;">
                                        <a href="{{unsubscribe_url}}" style="color: {EmailTemplate.BRAND_COLORS['primary']}; text-decoration: none;">Unsubscribe</a> |
                                        <a href="{{preferences_url}}" style="color: {EmailTemplate.BRAND_COLORS['primary']}; text-decoration: none;">Preferences</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

    @staticmethod
    def welcome(name: str, dashboard_url: str = "https://maiki.ai/dashboard") -> Dict[str, str]:
        """Welcome email for new users."""
        content = f"""
            <h2 style="margin: 0 0 20px; font-size: 24px; color: #ffffff;">Welcome to Maiki, {name}!</h2>
            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                You've just joined the world's leading platform for AI-human collaboration in remote work.
            </p>
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                Whether you're here to find top-tier virtual assistants or showcase your skills as a VA,
                Maiki provides the tools, community, and opportunities to thrive in the digital economy.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{dashboard_url}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
            </div>
            <div style="background: rgba(139, 92, 246, 0.1); border-left: 4px solid #8B5CF6; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                <h3 style="margin: 0 0 12px; font-size: 16px; color: #FBBF24;">Quick Start:</h3>
                <ul style="margin: 0; padding-left: 20px; color: rgba(255,255,255,0.8);">
                    <li>Complete your profile to unlock opportunities</li>
                    <li>Take skill assessments to earn badges</li>
                    <li>Join a guild to access exclusive jobs</li>
                    <li>Set up your wallet for instant payments</li>
                </ul>
            </div>
        """
        return {
            "subject": "Welcome to Maiki - Your journey starts here 🚀",
            "html": EmailTemplate._base_template(content, "Start your journey with Maiki today"),
            "text": f"""Welcome to Maiki, {name}!

You've joined the world's leading platform for AI-human collaboration.

Get started: {dashboard_url}

- Complete your profile
- Take skill assessments
- Join a guild
- Set up your wallet

The Maiki Team
""",
        }

    @staticmethod
    def password_reset(reset_url: str, expires_in: str = "1 hour") -> Dict[str, str]:
        """Password reset email."""
        content = f"""
            <h2 style="margin: 0 0 20px; font-size: 24px; color: #ffffff;">Reset Your Password</h2>
            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                We received a request to reset your Maiki password. Click the button below to set a new password.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{reset_url}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
            </div>
            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.6);">
                This link expires in {expires_in}. If you didn't request this, you can safely ignore this email.
            </p>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.6);">
                Having trouble? Copy and paste this URL into your browser:<br>
                <code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; word-break: break-all;">{reset_url}</code>
            </p>
        """
        return {
            "subject": "Password Reset Request - Maiki",
            "html": EmailTemplate._base_template(content),
            "text": f"""Reset Your Maiki Password

Click this link to reset your password: {reset_url}

This link expires in {expires_in}.

If you didn't request this, ignore this email.
""",
        }

    @staticmethod
    def job_match(name: str, job_title: str, company: str, job_url: str) -> Dict[str, str]:
        """Job match notification email."""
        content = f"""
            <h2 style="margin: 0 0 20px; font-size: 24px; color: #ffffff;">New Job Match, {name}!</h2>
            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                We've found a job that matches your skills and experience.
            </p>
            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); padding: 24px; border-radius: 12px; margin: 24px 0;">
                <h3 style="margin: 0 0 8px; font-size: 20px; color: #FBBF24;">{job_title}</h3>
                <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.8);">at {company}</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{job_url}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Job Details</a>
            </div>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.6); text-align: center;">
                Jobs are filled fast on Maiki. Apply within 24 hours for best results.
            </p>
        """
        return {
            "subject": f"🎯 New Job Match: {job_title}",
            "html": EmailTemplate._base_template(content, f"{company} is looking for someone like you"),
            "text": f"""New Job Match!

{job_title}
at {company}

View and apply: {job_url}
""",
        }

    @staticmethod
    def application_accepted(name: str, job_title: str, employer: str, next_steps_url: str) -> Dict[str, str]:
        """Application accepted notification."""
        content = f"""
            <h2 style="margin: 0 0 20px; font-size: 24px; color: #ffffff;">🎉 Congratulations, {name}!</h2>
            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                Your application for <strong style="color: #FBBF24;">{job_title}</strong> at {employer} has been accepted!
            </p>
            <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(139, 92, 246, 0.2)); border: 1px solid rgba(251, 191, 36, 0.3); padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
                <span style="font-size: 48px;">🚀</span>
                <p style="margin: 16px 0 0; font-size: 18px; color: #FBBF24; font-weight: 600;">You're Hired!</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{next_steps_url}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Next Steps</a>
            </div>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.6);">
                The employer will reach out shortly with onboarding details. Make sure your profile is complete!
            </p>
        """
        return {
            "subject": f"🎉 Application Accepted: {job_title}",
            "html": EmailTemplate._base_template(content),
            "text": f"""Congratulations {name}!

Your application for {job_title} at {employer} has been ACCEPTED!

View next steps: {next_steps_url}

The employer will contact you shortly.
""",
        }

    @staticmethod
    def payment_received(name: str, amount: float, currency: str, job_title: str) -> Dict[str, str]:
        """Payment received notification."""
        content = f"""
            <h2 style="margin: 0 0 20px; font-size: 24px; color: #ffffff;">💰 Payment Received, {name}!</h2>
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                Your earnings from <strong style="color: #FBBF24;">{job_title}</strong> have been deposited to your Maiki wallet.
            </p>
            <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(139, 92, 246, 0.2)); border: 1px solid rgba(34, 197, 94, 0.3); padding: 32px; border-radius: 12px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.6);">Amount Deposited</p>
                <p style="margin: 8px 0 0; font-size: 48px; font-weight: 700; color: #22C55E;">{currency} {amount:,.2f}</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <a href="https://maiki.ai/dashboard/earnings" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Earnings</a>
            </div>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.6); text-align: center;">
                Funds are available immediately. Withdraw to your bank anytime.
            </p>
        """
        return {
            "subject": f"💰 Payment Received: {currency} {amount:,.2f}",
            "html": EmailTemplate._base_template(content),
            "text": f"""Payment Received!

{currency} {amount:,.2f} has been deposited to your wallet for {job_title}.

View earnings: https://maiki.ai/dashboard/earnings
""",
        }

    @staticmethod
    def tier_upgrade(name: str, old_tier: str, new_tier: str, benefits: List[str]) -> Dict[str, str]:
        """Tier upgrade notification."""
        benefits_html = "".join([f'<li style="margin: 8px 0; color: rgba(255,255,255,0.8);">{b}</li>' for b in benefits])
        content = f"""
            <h2 style="margin: 0 0 20px; font-size: 24px; color: #ffffff;">⭐ Tier Upgrade, {name}!</h2>
            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                You've been promoted from <span style="color: #9CA3AF;">{old_tier}</span> to <span style="color: #FBBF24; font-weight: 600;">{new_tier}</span>!
            </p>
            <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(251, 191, 36, 0.2)); border: 1px solid rgba(251, 191, 36, 0.3); padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
                <span style="font-size: 64px;">🏆</span>
                <h3 style="margin: 16px 0 0; font-size: 24px; color: #FBBF24; font-weight: 700;">{new_tier}</h3>
            </div>
            <div style="background: rgba(139, 92, 246, 0.1); border-left: 4px solid #8B5CF6; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                <h3 style="margin: 0 0 12px; font-size: 16px; color: #FBBF24;">Your New Benefits:</h3>
                <ul style="margin: 0; padding-left: 20px;">{benefits_html}</ul>
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <a href="https://maiki.ai/dashboard/growth" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Progress</a>
            </div>
        """
        return {
            "subject": f"⭐ You've Been Promoted to {new_tier}!",
            "html": EmailTemplate._base_template(content),
            "text": f"""Tier Upgrade!

You've been promoted from {old_tier} to {new_tier}!

New benefits:
{chr(10).join(f"• {b}" for b in benefits)}

View progress: https://maiki.ai/dashboard/growth
""",
        }

    @staticmethod
    def course_complete(name: str, course_name: str, certificate_url: str) -> Dict[str, str]:
        """Course completion certificate email."""
        content = f"""
            <h2 style="margin: 0 0 20px; font-size: 24px; color: #ffffff;">🎓 Course Completed!</h2>
            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
                Congratulations {name}, you've successfully completed <strong style="color: #FBBF24;">{course_name}</strong>!
            </p>
            <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(251, 191, 36, 0.2)); border: 1px solid rgba(251, 191, 36, 0.3); padding: 32px; border-radius: 12px; margin: 24px 0; text-align: center;">
                <span style="font-size: 64px;">📜</span>
                <p style="margin: 16px 0 0; font-size: 20px; color: #FBBF24; font-weight: 600;">Certificate of Completion</p>
                <p style="margin: 8px 0 0; font-size: 16px; color: rgba(255,255,255,0.8);">{course_name}</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{certificate_url}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #A78BFA); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Download Certificate</a>
            </div>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.6); text-align: center;">
                This certificate has been added to your profile and can be shared on LinkedIn.
            </p>
        """
        return {
            "subject": f"🎓 Certificate: {course_name}",
            "html": EmailTemplate._base_template(content),
            "text": f"""Course Completed!

Congratulations {name}!

You've completed {course_name}.

Download your certificate: {certificate_url}

This certificate has been added to your profile.
""",
        }


# Singleton instance
sendgrid_service = SendGridService()
