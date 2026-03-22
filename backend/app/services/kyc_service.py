"""KYC verification service using SmileID and Veriff."""
import os
import base64
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
import hashlib
import hmac

import requests
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.config import settings


class SmileIDService:
    """Smile ID API integration for African KYC."""

    def __init__(self):
        self.api_key = os.getenv("SMILEID_API_KEY")
        self.partner_id = os.getenv("SMILEID_PARTNER_ID")
        self.secret_key = os.getenv("SMILEID_SECRET_KEY")
        self.base_url = "https://api.smileidentity.com/v1"

    def _generate_signature(self, timestamp: str) -> str:
        """Generate HMAC signature for SmileID."""
        message = f"{self.partner_id}:{timestamp}"
        return hmac.new(
            self.secret_key.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

    def submit_job(
        self,
        user_id: str,
        job_type: str,  # "enhanced_kyc" | "biometric_kyc" | "document_verification"
        id_type: str,   # "PASSPORT", "ID_CARD", "DRIVERS_LICENSE", etc
        id_number: str,
        country: str,   # "NG", "KE", "ZA", "GH", etc
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        dob: Optional[str] = None,
        phone: Optional[str] = None,
        image_base64: Optional[str] = None,  # For biometric
    ) -> Dict[str, Any]:
        """Submit a KYC verification job to SmileID."""
        if not all([self.api_key, self.partner_id, self.secret_key]):
            return {"status": False, "message": "SmileID not configured"}

        try:
            timestamp = datetime.utcnow().isoformat()
            signature = self._generate_signature(timestamp)

            payload = {
                "partner_id": self.partner_id,
                "api_key": self.api_key,
                "timestamp": timestamp,
                "signature": signature,
                "user_id": user_id,
                "job_type": job_type,
                "country": country,
                "id_type": id_type,
                "id_number": id_number,
                "first_name": first_name,
                "last_name": last_name,
                "dob": dob,
                "phone_number": phone,
            }

            if image_base64:
                payload["image"] = image_base64

            response = requests.post(
                f"{self.base_url}/upload",
                json=payload,
                timeout=30,
            )
            response.raise_for_status()
            result = response.json()

            return {
                "status": True,
                "job_id": result.get("job_id"),
                "success": result.get("success"),
                "result": result,
            }

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def check_job_status(self, job_id: str) -> Dict[str, Any]:
        """Check the status of a KYC job."""
        if not all([self.api_key, self.partner_id]):
            return {"status": False, "message": "SmileID not configured"}

        try:
            timestamp = datetime.utcnow().isoformat()
            signature = self._generate_signature(timestamp)

            payload = {
                "partner_id": self.partner_id,
                "api_key": self.api_key,
                "timestamp": timestamp,
                "signature": signature,
                "job_id": job_id,
            }

            response = requests.post(
                f"{self.base_url}/upload_status",
                json=payload,
                timeout=30,
            )
            response.raise_for_status()

            return {
                "status": True,
                "data": response.json(),
            }

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def get_supported_ids(self, country: str) -> Dict[str, Any]:
        """Get supported ID types for a country."""
        id_types = {
            "NG": ["PASSPORT", "ID_CARD", "DRIVERS_LICENSE", "VOTER_ID", "NIN_SLIP"],
            "KE": ["PASSPORT", "ID_CARD", "DRIVERS_LICENSE", "ALIEN_CARD"],
            "ZA": ["PASSPORT", "ID_CARD", "DRIVERS_LICENSE"],
            "GH": ["PASSPORT", "VOTER_ID", "DRIVERS_LICENSE", "SSNIT"],
            "UG": ["PASSPORT", "ID_CARD", "DRIVERS_LICENSE"],
            "TZ": ["PASSPORT", "ID_CARD", "DRIVERS_LICENSE"],
            "RW": ["PASSPORT", "ID_CARD"],
        }
        return {
            "status": True,
            "country": country,
            "supported_ids": id_types.get(country, ["PASSPORT", "ID_CARD"]),
        }


class VeriffService:
    """Veriff API integration for global ID verification."""

    def __init__(self):
        self.api_key = os.getenv("VERIFF_API_KEY")
        self.secret_key = os.getenv("VERIFF_SECRET_KEY")
        self.base_url = "https://stationapi.veriff.com"

    def _generate_signature(self, payload: str) -> str:
        """Generate HMAC signature for Veriff."""
        return hmac.new(
            self.secret_key.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

    def create_session(
        self,
        user_id: str,
        full_name: Optional[str] = None,
        lang: str = "en",
        redirect_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a Veriff verification session."""
        if not self.api_key:
            return {"status": False, "message": "Veriff not configured"}

        try:
            payload = {
                "verification": {
                    "callback": redirect_url or "https://maiki.ai/api/v1/kyc/veriff/callback",
                    "person": {
                        "firstName": full_name.split()[0] if full_name else None,
                        "lastName": " ".join(full_name.split()[1:]) if full_name and len(full_name.split()) > 1 else None,
                    } if full_name else {},
                    "vendorData": user_id,
                    "lang": lang,
                }
            }

            headers = {
                "X-AUTH-CLIENT": self.api_key,
                "Content-Type": "application/json",
            }

            response = requests.post(
                f"{self.base_url}/v1/sessions",
                json=payload,
                headers=headers,
                timeout=30,
            )
            response.raise_for_status()
            result = response.json()

            return {
                "status": True,
                "session_id": result.get("verification", {}).get("id"),
                "url": result.get("verification", {}).get("url"),
                "host": result.get("verification", {}).get("host"),
                "status": result.get("verification", {}).get("status"),
            }

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def get_session(self, session_id: str) -> Dict[str, Any]:
        """Get session details and status."""
        if not self.api_key:
            return {"status": False, "message": "Veriff not configured"}

        try:
            headers = {
                "X-AUTH-CLIENT": self.api_key,
            }

            response = requests.get(
                f"{self.base_url}/v1/sessions/{session_id}",
                headers=headers,
                timeout=30,
            )
            response.raise_for_status()

            return {
                "status": True,
                "data": response.json(),
            }

        except requests.exceptions.RequestException as e:
            return {"status": False, "message": str(e)}

    def verify_webhook(self, signature: str, payload: str) -> bool:
        """Verify webhook signature from Veriff."""
        expected = self._generate_signature(payload)
        return hmac.compare_digest(signature, expected)


class KYCService:
    """Unified KYC service combining SmileID and Veriff."""

    def __init__(self):
        self.smileid = SmileIDService()
        self.veriff = VeriffService()

    def get_recommended_provider(self, country: str, id_type: Optional[str] = None) -> str:
        """Recommend best KYC provider based on location."""
        # SmileID is optimized for African countries
        african_countries = ["NG", "KE", "ZA", "GH", "UG", "TZ", "RW", "SN", "CI", "EG"]

        if country.upper() in african_countries:
            return "smileid"
        return "veriff"

    def start_verification(
        self,
        db: Session,
        user: User,
        provider: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Start KYC verification with appropriate provider."""
        # Auto-select provider if not specified
        if not provider:
            country = kwargs.get("country", user.country or "NG")
            provider = self.get_recommended_provider(country)

        if provider == "smileid":
            result = self.smileid.submit_job(
                user_id=str(user.id),
                **kwargs
            )
        else:
            result = self.veriff.create_session(
                user_id=str(user.id),
                full_name=user.full_name,
                **{k: v for k, v in kwargs.items() if k not in ["job_type", "id_type", "id_number", "country", "dob"]}
            )

        # Store verification attempt in database
        if result.get("status"):
            from app.models.kyc import KYCVerification

            verification = KYCVerification(
                user_id=user.id,
                provider=provider,
                provider_job_id=result.get("job_id") or result.get("session_id"),
                status="pending",
                country=kwargs.get("country"),
                id_type=kwargs.get("id_type"),
            )
            db.add(verification)
            db.commit()
            result["verification_id"] = verification.id

        return result

    def check_verification_status(
        self,
        db: Session,
        verification_id: int,
    ) -> Dict[str, Any]:
        """Check verification status."""
        from app.models.kyc import KYCVerification

        verification = db.query(KYCVerification).filter(
            KYCVerification.id == verification_id
        ).first()

        if not verification:
            return {"status": False, "message": "Verification not found"}

        if verification.provider == "smileid":
            result = self.smileid.check_job_status(verification.provider_job_id)
        else:
            result = self.veriff.get_session(verification.provider_job_id)

        # Update status in database
        if result.get("status"):
            new_status = self._map_provider_status(
                verification.provider,
                result.get("data", {})
            )
            if new_status != verification.status:
                verification.status = new_status
                verification.verified_at = datetime.utcnow() if new_status == "approved" else None
                db.commit()

        return result

    def _map_provider_status(self, provider: str, data: Dict) -> str:
        """Map provider-specific status to unified status."""
        if provider == "smileid":
            smile_status = data.get("job_success", False)
            action = data.get("result", {}).get("action", "")
            if smile_status and action == "Verify":
                return "approved"
            elif action in ["Reject", "Too Much Blur"]:
                return "rejected"
            return "pending"
        else:  # veriff
            veriff_status = data.get("verification", {}).get("status", "")
            if veriff_status == "approved":
                return "approved"
            elif veriff_status in ["declined", "abandoned", "expired"]:
                return "rejected"
            return "pending"

    def handle_webhook(
        self,
        db: Session,
        provider: str,
        payload: Dict,
        signature: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Handle KYC webhook callbacks."""
        if provider == "veriff" and signature:
            # Verify webhook signature
            if not self.veriff.verify_webhook(signature, json.dumps(payload)):
                return {"status": False, "message": "Invalid signature"}

        # Extract provider-specific IDs and update status
        if provider == "smileid":
            job_id = payload.get("job_id")
            from app.models.kyc import KYCVerification
            verification = db.query(KYCVerification).filter(
                KYCVerification.provider_job_id == job_id
            ).first()
        else:
            session_id = payload.get("verification", {}).get("id")
            from app.models.kyc import KYCVerification
            verification = db.query(KYCVerification).filter(
                KYCVerification.provider_job_id == session_id
            ).first()

        if verification:
            new_status = self._map_provider_status(provider, payload)
            verification.status = new_status
            verification.provider_response = payload

            if new_status == "approved":
                verification.verified_at = datetime.utcnow()
                # Mark user as verified
                user = db.query(User).filter(User.id == verification.user_id).first()
                if user:
                    user.is_verified = True
                    user.verified_at = datetime.utcnow()

            db.commit()

            return {"status": True, "verification_id": verification.id, "new_status": new_status}

        return {"status": False, "message": "Verification not found"}


class KYCTemplate:
    """KYC-related document templates."""

    @staticmethod
    def required_documents(country: str, id_type: str) -> List[Dict]:
        """Get required documents for verification."""
        base_requirements = [
            {
                "type": "id_document",
                "description": f"Valid {id_type.replace('_', ' ').title()}",
                "required": True,
                "guidelines": [
                    "Must be clearly visible",
                    "All corners must be visible",
                    "No glare or blur",
                    "Must not be expired",
                ]
            },
            {
                "type": "selfie",
                "description": "Live selfie for biometric verification",
                "required": True,
                "guidelines": [
                    "Face clearly visible",
                    "Good lighting",
                    "Neutral expression",
                    "No glasses or hats",
                ]
            }
        ]

        # Add country-specific requirements
        if country in ["NG"] and id_type == "ID_CARD":
            base_requirements[0]["description"] = "National ID Card (NIMC or Voter Card)"

        return base_requirements

    @staticmethod
    def verification_steps() -> List[Dict]:
        """Step-by-step verification guide."""
        return [
            {
                "step": 1,
                "title": "Prepare Documents",
                "description": "Have your ID ready and ensure it's not expired",
                "duration": "1 minute",
            },
            {
                "step": 2,
                "title": "Upload ID",
                "description": "Take a clear photo of your ID document",
                "duration": "2 minutes",
            },
            {
                "step": 3,
                "title": "Take Selfie",
                "description": "We'll compare your selfie with your ID photo",
                "duration": "1 minute",
            },
            {
                "step": 4,
                "title": "Verification",
                "description": "Our systems verify your identity",
                "duration": "2-5 minutes",
            },
            {
                "step": 5,
                "title": "Complete",
                "description": "Start accepting jobs and withdrawing earnings",
                "duration": "Instant",
            },
        ]


# Singleton instances
smileid_service = SmileIDService()
veriff_service = VeriffService()
kyc_service = KYCService()
