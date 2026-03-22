"""Email API routes."""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user, require_admin
from app.models import User
from app.services.email_service import EmailService, NotificationService
from app.core.config import settings

router = APIRouter(prefix="/email", tags=["email"])


@router.post("/test")
def send_test_email(
    to_email: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Send test email (admin only)."""
    email_service = EmailService()

    html = """
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8b5cf6;">Test Email from Maiki</h1>
        <p>This is a test email to verify your email configuration is working.</p>
        <p>If you're receiving this, everything is set up correctly! 🎉</p>
    </div>
    """

    success = email_service._send_email([to_email], "Test Email from Maiki", html)

    if success:
        return {"message": "Test email sent successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send test email"
        )


@router.post("/welcome/{user_id}")
def send_welcome_email(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Send welcome email to a user."""
    # Only admins or the user themselves can trigger this
    if current_user.id != user_id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    email_service = EmailService()
    success = email_service.send_welcome_email(user)

    return {
        "message": "Welcome email sent" if success else "Failed to send welcome email",
        "success": success
    }
