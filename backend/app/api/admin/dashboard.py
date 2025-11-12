from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.api.admin.dependencies import require_admin
from app.services.admin_service import AdminService
from app.schemas.admin import (
    DashboardMetrics, UserGrowthData, DiseaseStatistic,
    AnalyticsTimeRange
)
from app.models.user import User


router = APIRouter(prefix="/admin/dashboard", tags=["admin-dashboard"])


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get comprehensive dashboard metrics
    
    Returns real-time statistics about:
    - User counts and activity
    - Sensor status and uptime
    - Disease detections
    - Support tickets
    - Revenue metrics
    """
    try:
        metrics = await AdminService.get_dashboard_metrics(db)
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard metrics: {str(e)}"
        )


@router.get("/user-growth", response_model=list[UserGrowthData])
async def get_user_growth(
    days: int = Query(default=30, ge=1, le=365, description="Number of days to fetch"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get user growth statistics over time
    
    Returns daily new user counts and running totals for charting
    """
    try:
        growth_data = await AdminService.get_user_growth_stats(db, days)
        return growth_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user growth data: {str(e)}"
        )


@router.get("/disease-statistics", response_model=list[DiseaseStatistic])
async def get_disease_statistics(
    days: int = Query(default=30, ge=1, le=365, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get disease detection statistics
    
    Returns breakdown of detected diseases with counts and percentages
    """
    try:
        stats = await AdminService.get_disease_statistics(db, days)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch disease statistics: {str(e)}"
        )


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get recent admin activities for audit trail
    
    Returns list of recent admin actions with timestamps
    """
    try:
        activities = await AdminService.get_recent_activities(db, limit)
        return [{
            "id": activity.id,
            "admin_id": activity.admin_id,
            "action": activity.action,
            "target_type": activity.target_type,
            "target_id": activity.target_id,
            "details": activity.details,
            "timestamp": activity.timestamp.isoformat()
        } for activity in activities]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch recent activities: {str(e)}"
        )


@router.get("/quick-stats")
async def get_quick_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get quick statistics for dashboard cards
    
    Returns simplified metrics for overview cards
    """
    try:
        metrics = await AdminService.get_dashboard_metrics(db)
        
        return {
            "users": {
                "total": metrics.total_users,
                "active": metrics.active_users,
                "new_today": metrics.new_users_today,
                "active_percentage": round((metrics.active_users / metrics.total_users * 100) if metrics.total_users > 0 else 0, 1)
            },
            "sensors": {
                "total": metrics.total_sensors,
                "online": metrics.online_sensors,
                "uptime_percent": metrics.sensor_uptime_percent
            },
            "detections": {
                "today": metrics.detections_today,
                "this_week": metrics.detections_this_week
            },
            "support": {
                "open_tickets": metrics.open_tickets,
                "pending_moderation": metrics.pending_moderation
            },
            "revenue": {
                "monthly": metrics.monthly_revenue
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch quick stats: {str(e)}"
        )
