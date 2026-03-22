"""Analytics API routes for AI-powered reporting."""
from typing import Any, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user, require_admin
from app.models import User
from app.services.analytics_service import AnalyticsService, get_analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/realtime")
def get_realtime_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Get real-time platform statistics."""
    analytics = get_analytics_service(db)
    return analytics.get_realtime_stats()


@router.get("/revenue")
def get_revenue_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    group_by: str = Query("day", regex="^(day|week|month)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Get comprehensive revenue analytics."""
    analytics = get_analytics_service(db)
    return analytics.get_revenue_metrics(start_date, end_date, group_by)


@router.get("/talent")
def get_talent_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Get talent pool analytics."""
    analytics = get_analytics_service(db)
    return analytics.get_talent_analytics()


@router.get("/talent/progression")
def get_talent_progression(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Get tier progression funnel."""
    analytics = get_analytics_service(db)
    return analytics.get_talent_progression_funnel()


@router.get("/matching")
def get_matching_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Get AI matching effectiveness metrics."""
    analytics = get_analytics_service(db)
    return analytics.get_matching_analytics()


@router.get("/churn-prediction")
def get_churn_prediction(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Get churn risk prediction for VAs."""
    analytics = get_analytics_service(db)
    return analytics.get_churn_prediction()


@router.get("/growth")
def get_growth_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Get platform growth metrics."""
    analytics = get_analytics_service(db)
    return analytics.get_platform_growth_metrics()


@router.get("/dashboard")
def get_full_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Get complete dashboard data."""
    analytics = get_analytics_service(db)

    return {
        "realtime": analytics.get_realtime_stats(),
        "revenue": analytics.get_revenue_metrics(),
        "talent": analytics.get_talent_analytics(),
        "matching": analytics.get_matching_analytics(),
        "churn": analytics.get_churn_prediction(),
        "growth": analytics.get_platform_growth_metrics(),
    }


@router.get("/export")
def export_analytics(
    report_type: str = Query("revenue", regex="^(revenue|talent|matching|full)$"),
    format: str = Query("json", regex="^(json|csv|pdf)$"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> Any:
    """Export analytics data."""
    analytics = get_analytics_service(db)

    if report_type == "revenue":
        data = analytics.get_revenue_metrics(start_date, end_date)
    elif report_type == "talent":
        data = analytics.get_talent_analytics()
    elif report_type == "matching":
        data = analytics.get_matching_analytics()
    else:
        data = analytics.get_full_dashboard()

    if format == "csv":
        # Would convert to CSV
        return {"data": data, "format": "csv", "note": "CSV conversion not yet implemented"}

    return data
