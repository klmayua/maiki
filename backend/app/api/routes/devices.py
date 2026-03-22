"""Device management routes for mobile."""
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.models.device import UserDevice
from app.models import User

router = APIRouter(prefix="/devices", tags=["devices"])


@router.post("/register")
def register_device(
    *,
    db: Session = Depends(get_db),
    device_token: str,
    device_type: str,  # ios, android, web
    device_name: str = None,
    device_model: str = None,
    os_version: str = None,
    app_version: str = None,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Register a device for push notifications."""
    # Check if device already exists
    existing = db.query(UserDevice).filter(
        UserDevice.device_token == device_token
    ).first()

    if existing:
        # Update existing device
        existing.user_id = current_user.id
        existing.device_type = device_type
        existing.device_name = device_name
        existing.device_model = device_model
        existing.os_version = os_version
        existing.app_version = app_version
        existing.is_active = True
        existing.last_used_at = datetime.utcnow()
        db.add(existing)
        db.commit()
        return {"message": "Device updated", "device_id": existing.id}

    # Create new device
    device = UserDevice(
        user_id=current_user.id,
        device_token=device_token,
        device_type=device_type,
        device_name=device_name,
        device_model=device_model,
        os_version=os_version,
        app_version=app_version,
    )

    db.add(device)
    db.commit()
    db.refresh(device)

    return {"message": "Device registered", "device_id": device.id}


@router.delete("/{device_id}")
def unregister_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Unregister a device."""
    device = db.query(UserDevice).filter(
        UserDevice.id == device_id,
        UserDevice.user_id == current_user.id
    ).first()

    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found",
        )

    device.is_active = False
    db.commit()

    return {"message": "Device unregistered"}


@router.get("/", response_model=List[dict])
def list_devices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List user's registered devices."""
    devices = db.query(UserDevice).filter(
        UserDevice.user_id == current_user.id,
        UserDevice.is_active == True
    ).all()

    return [
        {
            "id": d.id,
            "device_type": d.device_type,
            "device_name": d.device_name,
            "device_model": d.device_model,
            "push_enabled": d.push_enabled,
            "last_used_at": d.last_used_at,
            "created_at": d.created_at,
        }
        for d in devices
    ]


@router.put("/{device_id}/settings")
def update_device_settings(
    device_id: int,
    settings: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update device notification settings."""
    device = db.query(UserDevice).filter(
        UserDevice.id == device_id,
        UserDevice.user_id == current_user.id
    ).first()

    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found",
        )

    if "push_enabled" in settings:
        device.push_enabled = settings["push_enabled"]

    if "notification_settings" in settings:
        device.notification_settings = settings["notification_settings"]

    db.commit()

    return {"message": "Settings updated"}


@router.post("/test-notification")
def send_test_notification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Send test push notification to all user devices."""
    from app.services.push_notifications import push_service, NotificationTemplate

    template = NotificationTemplate.job_match(
        "Test Job",
        "Maiki"
    )

    count = await push_service.send_to_user(
        db,
        current_user.id,
        template["title"],
        template["body"],
        template["data"],
        action_url=template["action_url"],
    )

    return {"message": f"Sent to {count} devices"}
