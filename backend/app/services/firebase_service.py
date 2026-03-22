"""Firebase service for storage, analytics, and cloud functions."""
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
import base64

import firebase_admin
from firebase_admin import credentials, storage, firestore, auth, messaging
from firebase_admin.exceptions import FirebaseError


class FirebaseService:
    """Firebase integration for Maiki platform."""

    def __init__(self):
        self.app = None
        self._init_app()
        self.bucket = None
        self.db = None
        self._init_services()

    def _init_app(self):
        """Initialize Firebase Admin SDK."""
        if not firebase_admin._apps:
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
            cred_json = os.getenv("FIREBASE_CREDENTIALS_JSON")

            try:
                if cred_path and os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                elif cred_json:
                    # Parse JSON from env variable
                    import json
                    cred_dict = json.loads(cred_json)
                    cred = credentials.Certificate(cred_dict)
                else:
                    # Try to use default credentials
                    cred = None

                self.app = firebase_admin.initialize_app(cred, {
                    "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET"),
                    "databaseURL": os.getenv("FIREBASE_DATABASE_URL"),
                })
            except Exception as e:
                print(f"Firebase initialization warning: {e}")
                self.app = None

    def _init_services(self):
        """Initialize Firebase services."""
        if self.app:
            try:
                self.bucket = storage.bucket()
                self.db = firestore.client()
            except Exception as e:
                print(f"Firebase services warning: {e}")

    # ==================== Storage ====================

    def upload_file(
        self,
        file_data: bytes,
        destination_path: str,
        content_type: str = "application/octet-stream",
        metadata: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Upload a file to Firebase Storage."""
        if not self.bucket:
            return {"status": False, "message": "Firebase Storage not initialized"}

        try:
            blob = self.bucket.blob(destination_path)

            if metadata:
                blob.metadata = metadata

            blob.upload_from_string(file_data, content_type=content_type)

            # Make public for direct access (optional)
            blob.make_public()

            return {
                "status": True,
                "url": blob.public_url,
                "path": destination_path,
                "name": blob.name,
            }

        except FirebaseError as e:
            return {"status": False, "message": str(e)}
        except Exception as e:
            return {"status": False, "message": str(e)}

    def upload_profile_image(
        self,
        user_id: int,
        image_data: bytes,
        content_type: str = "image/jpeg",
    ) -> Dict[str, Any]:
        """Upload user profile image."""
        timestamp = int(datetime.utcnow().timestamp())
        path = f"profiles/{user_id}/avatar_{timestamp}.jpg"

        result = self.upload_file(
            file_data=image_data,
            destination_path=path,
            content_type=content_type,
            metadata={"user_id": str(user_id), "type": "profile"},
        )

        if result["status"]:
            # Also create a thumbnail (in production, use Cloud Functions)
            pass

        return result

    def upload_id_document(
        self,
        user_id: int,
        document_data: bytes,
        doc_type: str,
        content_type: str = "image/jpeg",
    ) -> Dict[str, Any]:
        """Upload KYC ID document."""
        timestamp = int(datetime.utcnow().timestamp())
        path = f"kyc/{user_id}/{doc_type}_{timestamp}.jpg"

        return self.upload_file(
            file_data=document_data,
            destination_path=path,
            content_type=content_type,
            metadata={
                "user_id": str(user_id),
                "type": "kyc",
                "document_type": doc_type,
            },
        )

    def upload_portfolio_item(
        self,
        user_id: int,
        file_data: bytes,
        filename: str,
        content_type: str,
    ) -> Dict[str, Any]:
        """Upload portfolio item."""
        timestamp = int(datetime.utcnow().timestamp())
        path = f"portfolios/{user_id}/{timestamp}_{filename}"

        return self.upload_file(
            file_data=file_data,
            destination_path=path,
            content_type=content_type,
            metadata={"user_id": str(user_id), "type": "portfolio"},
        )

    def delete_file(self, path: str) -> Dict[str, Any]:
        """Delete a file from Firebase Storage."""
        if not self.bucket:
            return {"status": False, "message": "Firebase Storage not initialized"}

        try:
            blob = self.bucket.blob(path)
            blob.delete()
            return {"status": True, "message": "File deleted"}
        except Exception as e:
            return {"status": False, "message": str(e)}

    def get_signed_url(
        self,
        path: str,
        expiration: int = 3600,  # 1 hour
    ) -> Dict[str, Any]:
        """Generate signed URL for temporary access."""
        if not self.bucket:
            return {"status": False, "message": "Firebase Storage not initialized"}

        try:
            blob = self.bucket.blob(path)
            url = blob.generate_signed_url(
                version="v4",
                expiration=expiration,
                method="GET",
            )
            return {"status": True, "url": url}
        except Exception as e:
            return {"status": False, "message": str(e)}

    # ==================== Firestore Analytics ====================

    def log_event(
        self,
        collection: str,
        event_type: str,
        user_id: Optional[int],
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Log analytics event to Firestore."""
        if not self.db:
            return {"status": False, "message": "Firestore not initialized"}

        try:
            event_data = {
                "event_type": event_type,
                "user_id": user_id,
                "timestamp": firestore.SERVER_TIMESTAMP,
                "data": data,
            }

            self.db.collection(collection).add(event_data)

            return {"status": True, "message": "Event logged"}
        except Exception as e:
            return {"status": False, "message": str(e)}

    def log_user_activity(
        self,
        user_id: int,
        activity_type: str,
        metadata: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Log user activity."""
        return self.log_event(
            collection="user_activities",
            event_type=activity_type,
            user_id=user_id,
            data=metadata or {},
        )

    def log_job_view(
        self,
        user_id: int,
        job_id: int,
        source: str = "browse",
    ) -> Dict[str, Any]:
        """Log job view event."""
        return self.log_event(
            collection="job_views",
            event_type="job_view",
            user_id=user_id,
            data={"job_id": job_id, "source": source},
        )

    def log_job_application(
        self,
        user_id: int,
        job_id: int,
        time_to_apply: int,  # seconds
    ) -> Dict[str, Any]:
        """Log job application event."""
        return self.log_event(
            collection="job_applications",
            event_type="application_submitted",
            user_id=user_id,
            data={"job_id": job_id, "time_to_apply": time_to_apply},
        )

    def log_payment(
        self,
        user_id: int,
        payment_type: str,  # deposit, withdrawal, transfer
        amount: float,
        currency: str,
        status: str,
    ) -> Dict[str, Any]:
        """Log payment event."""
        return self.log_event(
            collection="payments",
            event_type=payment_type,
            user_id=user_id,
            data={
                "amount": amount,
                "currency": currency,
                "status": status,
            },
        )

    def get_user_activity_summary(
        self,
        user_id: int,
        days: int = 30,
    ) -> Dict[str, Any]:
        """Get user activity summary."""
        if not self.db:
            return {"status": False, "message": "Firestore not initialized"}

        try:
            # Query activities from last N days
            from_date = datetime.utcnow() - timedelta(days=days)

            activities = self.db.collection("user_activities").where(
                "user_id", "==", user_id
            ).where(
                "timestamp", ">=", from_date
            ).stream()

            summary = {}
            for activity in activities:
                data = activity.to_dict()
                event_type = data.get("event_type")
                summary[event_type] = summary.get(event_type, 0) + 1

            return {
                "status": True,
                "user_id": user_id,
                "period_days": days,
                "activities": summary,
            }
        except Exception as e:
            return {"status": False, "message": str(e)}

    # ==================== Firebase Auth (optional - for mobile apps) ====================

    def create_custom_token(
        self,
        user_id: str,
        claims: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Create custom Firebase auth token."""
        if not self.app:
            return {"status": False, "message": "Firebase not initialized"}

        try:
            token = auth.create_custom_token(
                user_id,
                claims or {}
            )
            return {
                "status": True,
                "token": token.decode("utf-8"),
            }
        except Exception as e:
            return {"status": False, "message": str(e)}

    def verify_id_token(self, id_token: str) -> Dict[str, Any]:
        """Verify Firebase ID token."""
        if not self.app:
            return {"status": False, "message": "Firebase not initialized"}

        try:
            decoded = auth.verify_id_token(id_token)
            return {
                "status": True,
                "uid": decoded["uid"],
                "claims": decoded,
            }
        except Exception as e:
            return {"status": False, "message": str(e)}

    # ==================== Cloud Messaging ====================

    def send_topic_notification(
        self,
        topic: str,
        title: str,
        body: str,
        data: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Send notification to FCM topic."""
        if not self.app:
            return {"status": False, "message": "Firebase not initialized"}

        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                topic=topic,
            )

            response = messaging.send(message)
            return {"status": True, "message_id": response}
        except Exception as e:
            return {"status": False, "message": str(e)}

    def subscribe_to_topic(
        self,
        tokens: List[str],
        topic: str,
    ) -> Dict[str, Any]:
        """Subscribe tokens to a topic."""
        if not self.app:
            return {"status": False, "message": "Firebase not initialized"}

        try:
            response = messaging.subscribe_to_topic(tokens, topic)
            return {
                "status": True,
                "success_count": response.success_count,
                "failure_count": response.failure_count,
            }
        except Exception as e:
            return {"status": False, "message": str(e)}

    # ==================== Batch Operations ====================

    def batch_write(self, operations: List[Dict]) -> Dict[str, Any]:
        """Perform batch write to Firestore."""
        if not self.db:
            return {"status": False, "message": "Firestore not initialized"}

        try:
            batch = self.db.batch()

            for op in operations:
                collection = op["collection"]
                doc_id = op.get("doc_id")
                data = op["data"]

                doc_ref = self.db.collection(collection).document(doc_id or None)
                batch.set(doc_ref, data, merge=True)

            batch.commit()
            return {"status": True, "message": f"Batch write completed: {len(operations)} operations"}
        except Exception as e:
            return {"status": False, "message": str(e)}


class AnalyticsAggregator:
    """Helper class for aggregating analytics data."""

    def __init__(self, firebase_service: FirebaseService):
        self.firebase = firebase_service

    def get_daily_active_users(self, date: datetime) -> int:
        """Get DAU for a specific date."""
        # In production, query BigQuery or Firestore aggregation
        # This is a placeholder
        return 0

    def get_monthly_active_users(self, year: int, month: int) -> int:
        """Get MAU for a specific month."""
        return 0

    def get_conversion_rate(
        self,
        start_date: datetime,
        end_date: datetime,
    ) -> float:
        """Calculate application conversion rate."""
        return 0.0


# Singleton instance
firebase_service = FirebaseService()
analytics = AnalyticsAggregator(firebase_service)
