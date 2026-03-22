"""Email service using SendGrid."""
from typing import Optional, List, Dict, Any
from datetime import datetime

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent, TemplateId
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import User, Notification, Job, Application, Contract


class EmailService:
    """SendGrid email service."""

    def __init__(self):
        self.client = SendGridAPIClient(settings.SENDGRID_API_KEY)
        self.from_email = Email(settings.FROM_EMAIL or "noreply@maiki.io")
        self.from_name = settings.FROM_NAME or "Maiki"

    def _send_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        template_id: Optional[str] = None,
        dynamic_data: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send email via SendGrid."""
        try:
            if template_id and dynamic_data:
                # Use dynamic template
                message = Mail(
                    from_email=self.from_email,
                    to_emails=[To(email) for email in to_emails]
                )
                message.template_id = TemplateId(template_id)
                message.dynamic_template_data = dynamic_data
            else:
                # Use HTML content directly
                message = Mail(
                    from_email=self.from_email,
                    to_emails=[To(email) for email in to_emails],
                    subject=subject,
                    html_content=HtmlContent(html_content)
                )

            response = self.client.send(message)
            return response.status_code in [200, 202]

        except Exception as e:
            # Log error in production
            print(f"Failed to send email: {e}")
            return False

    def send_welcome_email(self, user: User) -> bool:
        """Send welcome email to new users."""
        subject = "Welcome to Maiki - Your VA Journey Starts Now!"

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">Welcome to Maiki, {user.first_name}! 🎉</h1>

            <p>We're thrilled to have you join the world's first Virtual Assistant Operating System.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Your Next Steps:</h3>
                <ol>
                    <li><strong>Complete your profile</strong> - Add your skills, experience, and portfolio</li>
                    <li><strong>Take your first course</strong> - Get certified and stand out</li>
                    <li><strong>Apply to your first job</strong> - Start earning on your terms</li>
                </ol>
            </div>

            <p>As a {user.tier.value.title()}, you're at the beginning of an incredible journey.
            Work your way up through our tier system to unlock higher rates and premium opportunities.</p>

            <a href="https://maiki.io/dashboard"
               style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Go to Dashboard
            </a>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Questions? Reply to this email or visit our Help Center.
            </p>
        </div>
        """

        return self._send_email([user.email], subject, html_content)

    def send_job_match_email(self, user: User, job: Job) -> bool:
        """Send job match notification to VAs."""
        subject = f"New Job Match: {job.title}"

        rate_display = f"${job.budget_min}-${job.budget_max}/hr" if job.hourly_rate else f"${job.budget_min}-${job.budget_max}"

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">New Job Match! 🎯</h1>

            <p>Hi {user.first_name},</p>

            <p>We found a job that matches your skills perfectly:</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>{job.title}</h3>
                <p><strong>Budget:</strong> {rate_display}</p>
                <p><strong>Type:</strong> {job.job_type.replace('_', ' ').title()}</p>
                <p><strong>Required Tier:</strong> {job.required_tier.value.title()}</p>

                <p style="margin-top: 15px;">
                    {job.description[:200]}{"..." if len(job.description) > 200 else ""}
                </p>
            </div>

            <p>This opportunity expires in 7 days, so apply soon!</p>

            <a href="https://maiki.io/dashboard/jobs/{job.id}"
               style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
                View Job & Apply
            </a>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                You're receiving this because your skills match this job posting.
            </p>
        </div>
        """

        return self._send_email([user.email], subject, html_content)

    def send_application_received_email(self, user: User, application: Application, job: Job) -> bool:
        """Notify client when a VA applies to their job."""
        subject = f"New Application: {job.title}"

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">New Application Received! 📬</h1>

            <p>Hi {user.first_name},</p>

            <p>Someone just applied to your job posting:</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>{job.title}</h3>

                <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 6px;">
                    <p><strong>Applicant:</strong> {application.applicant.first_name} {application.applicant.last_name}</p>
                    <p><strong>Tier:</strong> {application.applicant.tier.value.title()}</p>
                    <p><strong>Rating:</strong> ⭐ {application.applicant.rating}/5</p>
                    <p><strong>Proposed Rate:</strong> ${application.proposed_rate}/hr</p>
                </div>

                <p style="font-style: italic; margin-top: 15px;">
                    "{application.cover_letter[:200]}{"..." if len(application.cover_letter) > 200 else ""}"
                </p>
            </div>

            <a href="https://maiki.io/dashboard/applications/{application.id}"
               style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Review Application
            </a>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                You have 3 days to respond to this application.
            </p>
        </div>
        """

        return self._send_email([user.email], subject, html_content)

    def send_application_status_email(self, user: User, application: Application, job: Job) -> bool:
        """Notify VA when their application status changes."""
        status_messages = {
            "shortlisted": "Great news! You've been shortlisted! 🎉",
            "interview": "You've been invited to an interview! 🗣️",
            "accepted": "Congratulations! Your application was accepted! 🎊",
            "rejected": "Update on your application"
        }

        subject = status_messages.get(application.status, "Application Update")

        if application.status == "rejected":
            body = f"""
            <p>Thank you for your interest in "{job.title}".</p>
            <p>Unfortunately, the client has decided to move forward with another candidate.</p>
            <p>Don't be discouraged - there are many more opportunities waiting for you!</p>
            """
        else:
            body = f"""
            <p>Great news regarding your application for "{job.title}"!</p>
            <p>Your application has been moved to <strong>{application.status.upper()}</strong>.</p>
            <p>The client will contact you soon with next steps.</p>
            """

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">{subject}</h1>

            <p>Hi {user.first_name},</p>

            {body}

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Job Details</h3>
                <p><strong>Title:</strong> {job.title}</p>
                <p><strong>Client:</strong> {job.client.first_name} {job.client.last_name}</p>
                <p><strong>Status:</strong> {application.status.title()}</p>
            </div>

            <a href="https://maiki.io/dashboard/jobs"
               style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
                View Application
            </a>
        </div>
        """

        return self._send_email([user.email], subject, html_content)

    def send_payment_received_email(self, user: User, payment) -> bool:
        """Notify VA when they receive payment."""
        subject = f"Payment Received: ${payment.amount}"

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Payment Received! 💰</h1>

            <p>Hi {user.first_name},</p>

            <p>Great news! You just received a payment:</p>

            <div style="background: #d1fae5; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h2 style="color: #065f46; margin: 0; font-size: 36px;">${payment.amount}</h2>
                <p style="color: #065f46; margin: 10px 0 0 0;">has been added to your account</p>
            </div>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Payment Details</h3>
                <p><strong>Amount:</strong> ${payment.amount}</p>
                <p><strong>Type:</strong> {payment.type.replace('_', ' ').title()}</p>
                <p><strong>Date:</strong> {payment.created_at.strftime('%B %d, %Y')}</p>
                <p><strong>Description:</strong> {payment.description or 'N/A'}</p>
            </div>

            <a href="https://maiki.io/dashboard/earnings"
               style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
                View Earnings
            </a>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Funds will be available for withdrawal within 2-3 business days.
            </p>
        </div>
        """

        return self._send_email([user.email], subject, html_content)

    def send_review_request_email(self, user: User, contract: Contract) -> bool:
        """Request a review after contract completion."""
        subject = "Leave a Review - How was your experience?"

        # Determine who to review (the other party)
        if user.id == contract.client_id:
            reviewee = contract.va
            role = "Virtual Assistant"
        else:
            reviewee = contract.client
            role = "Client"

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">How was your experience? ⭐</h1>

            <p>Hi {user.first_name},</p>

            <p>Your work with <strong>{reviewee.first_name} {reviewee.last_name}</strong> has been completed.</p>

            <p>Please take a moment to leave a review. Your feedback helps build trust in the Maiki community.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="font-size: 24px; margin: 0;">⭐ ⭐ ⭐ ⭐ ⭐</p>
            </div>

            <a href="https://maiki.io/dashboard/reviews/new?contract={contract.id}"
               style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Leave a Review
            </a>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Reviews are visible to the community and help others make informed decisions.
            </p>
        </div>
        """

        return self._send_email([user.email], subject, html_content)

    def send_new_message_email(self, user: User, sender: User, message_preview: str) -> bool:
        """Notify user of new unread message."""
        subject = f"New message from {sender.first_name} {sender.last_name}"

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">New Message 💬</h1>

            <p>Hi {user.first_name},</p>

            <p>You have a new message from <strong>{sender.first_name} {sender.last_name}</strong>:</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-style: italic;">"{message_preview[:150]}{"..." if len(message_preview) > 150 else ""}"</p>
            </div>

            <a href="https://maiki.io/dashboard/messages"
               style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Reply Now
            </a>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                You're receiving this because you have unread messages.
            </p>
        </div>
        """

        return self._send_email([user.email], subject, html_content)

    def send_password_reset_email(self, user: User, reset_token: str) -> bool:
        """Send password reset link."""
        subject = "Reset your Maiki password"

        reset_url = f"https://maiki.io/reset-password?token={reset_token}"

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8b5cf6;">Reset Your Password</h1>

            <p>Hi {user.first_name},</p>

            <p>We received a request to reset your password. Click the button below to create a new password:</p>

            <a href="{reset_url}"
               style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Reset Password
            </a>

            <p style="color: #6b7280; font-size: 14px;">
                This link will expire in 1 hour.
            </p>

            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                If you didn't request this, you can safely ignore this email.
            </p>
        </div>
        """

        return self._send_email([user.email], subject, html_content)

    def send_marketing_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str
    ) -> bool:
        """Send marketing/bulk email."""
        return self._send_email(to_emails, subject, html_content)


class NotificationService:
    """Service for creating in-app notifications."""

    def __init__(self, db: Session):
        self.db = db
        self.email = EmailService()

    def create_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        notification_type: str,
        action_url: Optional[str] = None,
        send_email: bool = False,
        user: Optional[User] = None
    ) -> Notification:
        """Create in-app notification and optionally send email."""
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            action_url=action_url,
            is_read=False
        )

        self.db.add(notification)
        self.db.commit()

        # Send email if requested
        if send_email:
            if not user:
                user = self.db.query(User).filter(User.id == user_id).first()

            if user and user.email:
                # Use appropriate email template based on type
                if notification_type == "job":
                    self.email.send_job_match_email(user, None)  # Would need job object
                elif notification_type == "payment":
                    # Would need payment object
                    pass
                else:
                    # Generic notification email
                    html = f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #8b5cf6;">{title}</h1>
                        <p>{message}</p>
                        {f'<a href="https://maiki.io{action_url}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">View</a>' if action_url else ''}
                    </div>
                    """
                    self.email._send_email([user.email], title, html)

        return notification

    def mark_as_read(self, notification_id: int, user_id: int) -> Notification:
        """Mark notification as read."""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()

        if notification:
            notification.is_read = True
            self.db.commit()

        return notification

    def get_unread_count(self, user_id: int) -> int:
        """Get count of unread notifications."""
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
