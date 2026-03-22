"""KYC verification routes."""
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.models import User
from app.services.kyc_service import kyc_service
from app.services.firebase_service import firebase_service

router = APIRouter(prefix="/kyc", tags=["kyc"])


@router.get("/status")
def get_kyc_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get user's KYC verification status."""
    from app.models.kyc import KYCVerification

    verifications = db.query(KYCVerification).filter(
        KYCVerification.user_id == current_user.id
    ).order_by(KYCVerification.created_at.desc()).all()

    if not verifications:
        return {
            "is_verified": current_user.is_verified,
            "status": "not_started",
            "message": "Complete KYC to unlock withdrawals",
        }

    latest = verifications[0]

    return {
        "is_verified": current_user.is_verified,
        "status": latest.status.value,
        "provider": latest.provider.value,
        "submitted_at": latest.submitted_at.isoformat(),
        "verified_at": latest.verified_at.isoformat() if latest.verified_at else None,
        "country": latest.country,
        "id_type": latest.id_type,
    }


@router.get("/supported-ids/{country}")
def get_supported_ids(
    country: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get supported ID types for a country."""
    return kyc_service.smileid.get_supported_ids(country.upper())


@router.post("/verify")
def start_verification(
    country: str,
    id_type: str,
    id_number: str,
    first_name: str,
    last_name: str,
    dob: Optional[str] = None,  # YYYY-MM-DD
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Start KYC verification process."""
    # Check if already verified
    if current_user.is_verified:
        return {
            "status": True,
            "message": "Already verified",
        }

    # Upload ID document if provided
    result = kyc_service.start_verification(
        db=db,
        user=current_user,
        country=country.upper(),
        id_type=id_type,
        id_number=id_number,
        first_name=first_name,
        last_name=last_name,
        dob=dob,
    )

    if not result.get("status"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Verification failed"),
        )

    return result


@router.post("/upload-document")
async def upload_id_document(
    document_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Upload ID document for verification."""
    # Read file
    contents = await file.read()

    # Upload to Firebase Storage
    result = firebase_service.upload_id_document(
        user_id=current_user.id,
        document_data=contents,
        doc_type=document_type,
        content_type=file.content_type or "image/jpeg",
    )

    if not result.get("status"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message", "Upload failed"),
        )

    return {
        "status": True,
        "url": result["url"],
        "path": result["path"],
    }


@router.post("/upload-selfie")
async def upload_selfie(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Upload selfie for biometric verification."""
    contents = await file.read()

    # Upload to Firebase
    result = firebase_service.upload_file(
        file_data=contents,
        destination_path=f"kyc/{current_user.id}/selfie_{int(datetime.utcnow().timestamp())}.jpg",
        content_type=file.content_type or "image/jpeg",
        metadata={"user_id": str(current_user.id), "type": "selfie"},
    )

    if not result.get("status"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message", "Upload failed"),
        )

    return {
        "status": True,
        "url": result["url"],
        "path": result["path"],
    }


@router.get("/verification/{verification_id}")
def check_verification_status(
    verification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Check verification status."""
    result = kyc_service.check_verification_status(db, verification_id)

    if not result.get("status"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message", "Verification not found"),
        )

    return result


@router.post("/webhook/{provider}")
def kyc_webhook(
    provider: str,
    payload: dict,
    signature: Optional[str] = None,
    db: Session = Depends(get_db),
) -> Any:
    """Webhook for KYC provider callbacks."""
    result = kyc_service.handle_webhook(db, provider, payload, signature)

    if not result.get("status"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Webhook processing failed"),
        )

    return {"status": "received"}


from datetime import datetime
