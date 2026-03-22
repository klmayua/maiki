"""Analytics and reporting service for AI-powered insights."""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import func, distinct, case, desc
from sqlalchemy.orm import Session
import numpy as np

from app.models import (
    User, Job, Application, Payment, Review, Contract,
    UserRole, UserTier, PaymentStatus, PaymentType
)
from app.models.wallet import Transaction, TransactionType
from app.models.scraped_job import ScrapedJob, ScrapedJobSource


class AnalyticsService:
    """Comprehensive analytics service for platform intelligence."""

    def __init__(self, db: Session):
        self.db = db

    # ============== REVENUE INTELLIGENCE =============

    def get_revenue_metrics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        group_by: str = "day"  # day, week, month
    ) -> Dict[str, Any]:
        """Get comprehensive revenue metrics."""

        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()

        # GMV (Gross Merchandise Value)
        gmv_query = self.db.query(
            func.sum(Payment.amount).label("total_gmv"),
            func.count(Payment.id).label("transaction_count")
        ).filter(
            Payment.created_at >= start_date,
            Payment.created_at <= end_date,
            Payment.status == PaymentStatus.RELEASED
        ).first()

        # Platform revenue (commission)
        platform_revenue = self.db.query(
            func.sum(Payment.amount * Decimal("0.15"))  # 15% commission
        ).filter(
            Payment.created_at >= start_date,
            Payment.created_at <= end_date,
            Payment.status == PaymentStatus.RELEASED
        ).scalar() or 0

        # Revenue by type
        revenue_by_type = self.db.query(
            Payment.type,
            func.sum(Payment.amount).label("amount"),
            func.count(Payment.id).label("count")
        ).filter(
            Payment.created_at >= start_date,
            Payment.created_at <= end_date
        ).group_by(Payment.type).all()

        # Time series data
        time_series = self._get_revenue_time_series(start_date, end_date, group_by)

        return {
            "period": {"start": start_date.isoformat(), "end": end_date.isoformat()},
            "gmv": {
                "total": float(gmv_query.total_gmv or 0),
                "transaction_count": gmv_query.transaction_count or 0,
                "average_transaction": float(gmv_query.total_gmv or 0) / (gmv_query.transaction_count or 1),
            },
            "platform_revenue": float(platform_revenue),
            "take_rate": 15.0,  # Platform fee percentage
            "revenue_by_type": [
                {"type": r.type, "amount": float(r.amount), "count": r.count}
                for r in revenue_by_type
            ],
            "time_series": time_series,
        }

    def _get_revenue_time_series(
        self,
        start_date: datetime,
        end_date: datetime,
        group_by: str
    ) -> List[Dict[str, Any]]:
        """Get time-series revenue data."""

        if group_by == "day":
            date_trunc = func.date_trunc('day', Payment.created_at)
        elif group_by == "week":
            date_trunc = func.date_trunc('week', Payment.created_at)
        else:  # month
            date_trunc = func.date_trunc('month', Payment.created_at)

        results = self.db.query(
            date_trunc.label("period"),
            func.sum(Payment.amount).label("gmv"),
            func.count(Payment.id).label("transactions"),
            func.sum(Payment.amount * Decimal("0.15")).label("revenue")
        ).filter(
            Payment.created_at >= start_date,
            Payment.created_at <= end_date
        ).group_by(date_trunc).order_by(date_trunc).all()

        return [
            {
                "period": r.period.isoformat() if r.period else None,
                "gmv": float(r.gmv or 0),
                "transactions": r.transactions,
                "revenue": float(r.revenue or 0),
            }
            for r in results
        ]

    # ============== TALENT ANALYTICS =============

    def get_talent_analytics(self) -> Dict[str, Any]:
        """Get comprehensive talent pool analytics."""

        # Total counts by tier
        tier_distribution = self.db.query(
            User.tier,
            func.count(User.id).label("count"),
            func.avg(User.rating).label("avg_rating"),
            func.avg(User.hours_worked).label("avg_hours")
        ).filter(
            User.role.in_(["va", "both"]),
            User.is_active == True
        ).group_by(User.tier).all()

        # Skills demand (top skills)
        from app.models import user_skills
        top_skills = self.db.query(
            Skill.name,
            func.count(user_skills.c.user_id).label("user_count")
        ).join(
            user_skills, Skill.id == user_skills.c.skill_id
        ).group_by(Skill.name).order_by(desc("user_count")).limit(20).all()

        # Geographic distribution
        geo_distribution = self.db.query(
            User.country,
            func.count(User.id).label("count")
        ).filter(
            User.role.in_(["va", "both"]),
            User.is_active == True
        ).group_by(User.country).order_by(desc("count")).limit(10).all()

        # Verification rates
        verification_stats = self.db.query(
            func.count(User.id).label("total"),
            func.sum(case((User.is_verified == True, 1), else_=0)).label("verified")
        ).filter(
            User.role.in_(["va", "both"])
        ).first()

        # Activity metrics (logged in within 30 days)
        active_threshold = datetime.utcnow() - timedelta(days=30)
        active_count = self.db.query(func.count(User.id)).filter(
            User.role.in_(["va", "both"]),
            User.last_login >= active_threshold
        ).scalar()

        return {
            "total_vas": verification_stats.total or 0,
            "verified_vas": verification_stats.verified or 0,
            "verification_rate": (verification_stats.verified / verification_stats.total * 100) if verification_stats.total else 0,
            "active_last_30_days": active_count or 0,
            "activity_rate": (active_count / verification_stats.total * 100) if verification_stats.total else 0,
            "tier_distribution": [
                {
                    "tier": t.tier.value,
                    "count": t.count,
                    "avg_rating": float(t.avg_rating or 0),
                    "avg_hours": float(t.avg_hours or 0),
                }
                for t in tier_distribution
            ],
            "top_skills": [{"skill": s.name, "count": s.user_count} for s in top_skills],
            "geographic_distribution": [{"country": g.country or "Unknown", "count": g.count} for g in geo_distribution],
        }

    def get_talent_progression_funnel(self) -> Dict[str, Any]:
        """Get tier progression funnel."""

        tiers = ["apprentice", "associate", "professional", "expert", "master", "legend"]
        funnel = []

        for i, tier in enumerate(tiers):
            count = self.db.query(func.count(User.id)).filter(
                User.tier == tier.upper(),
                User.role.in_(["va", "both"])
            ).scalar() or 0

            # Calculate progression rate from previous tier
            prev_count = funnel[-1]["count"] if funnel else count
            progression_rate = (count / prev_count * 100) if prev_count > 0 and i > 0 else 100

            funnel.append({
                "tier": tier,
                "count": count,
                "progression_rate": progression_rate if i > 0 else 100,
            })

        return {
            "funnel": funnel,
            "total_progression_rate": (funnel[-1]["count"] / funnel[0]["count"] * 100) if funnel[0]["count"] > 0 else 0,
        }

    # ============== MATCHING EFFECTIVENESS =============

    def get_matching_analytics(self) -> Dict[str, Any]:
        """Get AI matching effectiveness metrics."""

        # Match score distribution
        match_scores = self.db.query(
            Application.job_id,
            Application.applicant_id,
            Application.status
        ).limit(1000).all()

        # Application-to-hire conversion
        total_applications = self.db.query(func.count(Application.id)).scalar() or 0
        accepted_applications = self.db.query(func.count(Application.id)).filter(
            Application.status == "accepted"
        ).scalar() or 0

        conversion_rate = (accepted_applications / total_applications * 100) if total_applications > 0 else 0

        # Time to fill
        avg_time_to_fill = self.db.query(
            func.avg(Contract.start_date - Job.created_at)
        ).join(Job).filter(
            Contract.is_active == True
        ).scalar()

        # Match score accuracy (if we have scored matches)
        scored_matches = self.db.query(
            ScrapedJobMatch.match_score,
            ScrapedJobMatch.is_applied
        ).limit(1000).all()

        # High score (>80) application rate
        high_score_matches = [m for m in scored_matches if m.match_score > 80]
        high_score_apply_rate = (
            sum(1 for m in high_score_matches if m.is_applied) / len(high_score_matches) * 100
        ) if high_score_matches else 0

        return {
            "total_applications": total_applications,
            "accepted_applications": accepted_applications,
            "conversion_rate": conversion_rate,
            "avg_time_to_fill_days": str(avg_time_to_fill) if avg_time_to_fill else None,
            "high_match_score_application_rate": high_score_apply_rate,
        }

    # ============== PREDICTIVE ANALYTICS =============

    def get_churn_prediction(self) -> Dict[str, Any]:
        """Predict churn risk for VAs."""

        # Identify at-risk users (no login in 60 days, no jobs in progress)
        at_risk_threshold = datetime.utcnow() - timedelta(days=60)

        at_risk_vas = self.db.query(User).filter(
            User.role.in_(["va", "both"]),
            User.last_login <= at_risk_threshold,
            User.is_active == True
        ).limit(100).all()

        # Calculate risk scores
        risk_scores = []
        for va in at_risk_vas:
            risk_factors = 0
            risk_factors += 1 if not va.last_login or (datetime.utcnow() - va.last_login).days > 60 else 0
            risk_factors += 1 if float(va.hours_worked) < 10 else 0
            risk_factors += 1 if va.total_reviews == 0 else 0
            risk_factors += 1 if not va.skills else 0

            risk_level = "high" if risk_factors >= 3 else "medium" if risk_factors >= 2 else "low"

            risk_scores.append({
                "user_id": va.id,
                "name": f"{va.first_name} {va.last_name}",
                "risk_level": risk_level,
                "risk_factors": risk_factors,
                "last_login": va.last_login.isoformat() if va.last_login else None,
                "hours_worked": float(va.hours_worked),
            })

        return {
            "at_risk_count": len(risk_scores),
            "high_risk": len([r for r in risk_scores if r["risk_level"] == "high"]),
            "medium_risk": len([r for r in risk_scores if r["risk_level"] == "medium"]),
            "low_risk": len([r for r in risk_scores if r["risk_level"] == "low"]),
            "at_risk_users": risk_scores[:20],  # Top 20 at risk
        }

    def get_platform_growth_metrics(self) -> Dict[str, Any]:
        """Get platform growth and health metrics."""

        # Monthly growth
        last_month = datetime.utcnow() - timedelta(days=30)
        two_months_ago = datetime.utcnow() - timedelta(days=60)

        new_users_this_month = self.db.query(func.count(User.id)).filter(
            User.created_at >= last_month
        ).scalar() or 0

        new_users_last_month = self.db.query(func.count(User.id)).filter(
            User.created_at >= two_months_ago,
            User.created_at < last_month
        ).scalar() or 0

        growth_rate = (
            ((new_users_this_month - new_users_last_month) / new_users_last_month * 100)
            if new_users_last_month > 0 else 0
        )

        # Job posting growth
        new_jobs = self.db.query(func.count(Job.id)).filter(
            Job.created_at >= last_month
        ).scalar() or 0

        # Retention rate (active users from last month still active)
        retained_users = self.db.query(func.count(User.id)).filter(
            User.created_at < last_month,
            User.last_login >= last_month
        ).scalar() or 0

        total_last_month = self.db.query(func.count(User.id)).filter(
            User.created_at < last_month
        ).scalar() or 1

        retention_rate = (retained_users / total_last_month * 100)

        return {
            "user_growth": {
                "new_this_month": new_users_this_month,
                "new_last_month": new_users_last_month,
                "growth_rate": growth_rate,
            },
            "job_growth": {
                "new_jobs_this_month": new_jobs,
            },
            "retention": {
                "rate": retention_rate,
                "retained_users": retained_users,
                "total_base": total_last_month,
            },
            "health_score": min(100, (growth_rate + retention_rate) / 2),
        }

    # ============== REAL-TIME DASHBOARD DATA =============

    def get_realtime_stats(self) -> Dict[str, Any]:
        """Get real-time platform statistics."""

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "users": {
                "total": self.db.query(func.count(User.id)).scalar() or 0,
                "online_now": self.db.query(func.count(User.id)).filter(
                    User.last_login >= datetime.utcnow() - timedelta(minutes=15)
                ).scalar() or 0,
                "vas": self.db.query(func.count(User.id)).filter(
                    User.role.in_(["va", "both"])
                ).scalar() or 0,
                "clients": self.db.query(func.count(User.id)).filter(
                    User.role.in_(["client", "both"])
                ).scalar() or 0,
            },
            "jobs": {
                "total": self.db.query(func.count(Job.id)).scalar() or 0,
                "open": self.db.query(func.count(Job.id)).filter(
                    Job.status == "open"
                ).scalar() or 0,
                "filled_today": self.db.query(func.count(Job.id)).filter(
                    Job.status == "in_progress",
                    Job.updated_at >= datetime.utcnow() - timedelta(days=1)
                ).scalar() or 0,
            },
            "applications": {
                "total": self.db.query(func.count(Application.id)).scalar() or 0,
                "pending": self.db.query(func.count(Application.id)).filter(
                    Application.status == "pending"
                ).scalar() or 0,
                "today": self.db.query(func.count(Application.id)).filter(
                    Application.created_at >= datetime.utcnow() - timedelta(days=1)
                ).scalar() or 0,
            },
            "revenue": {
                "today": float(self.db.query(func.sum(Payment.amount)).filter(
                    Payment.created_at >= datetime.utcnow() - timedelta(days=1),
                    Payment.status == PaymentStatus.RELEASED
                ).scalar() or 0),
            },
        }


# Singleton instance
def get_analytics_service(db: Session) -> AnalyticsService:
    return AnalyticsService(db)
