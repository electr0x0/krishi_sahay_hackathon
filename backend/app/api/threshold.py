"""
Threshold Management API Endpoints

CRUD operations for sensor thresholds and notification history.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.threshold import SensorThreshold, ThresholdNotification
from app.schemas.threshold import (
    ThresholdCreate, ThresholdUpdate, ThresholdResponse,
    ThresholdListResponse, NotificationHistoryResponse,
    NotificationHistoryItem, ThresholdSummary, CurrentSensorReadings
)
from app.models.sensor import SensorData
from app.services.threshold_monitor_service import get_threshold_monitor
from app.auth.dependencies import get_current_active_user
from datetime import datetime, timedelta

router = APIRouter()


@router.post("/thresholds", response_model=ThresholdResponse, status_code=201)
async def create_threshold(
    threshold_data: ThresholdCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new sensor threshold"""
    
    # Validate threshold values
    if threshold_data.threshold_type == "range":
        if threshold_data.min_value is None or threshold_data.max_value is None:
            raise HTTPException(
                status_code=400, 
                detail="min_value and max_value required for RANGE threshold"
            )
        if threshold_data.min_value >= threshold_data.max_value:
            raise HTTPException(
                status_code=400,
                detail="min_value must be less than max_value"
            )
    else:
        if threshold_data.threshold_value is None:
            raise HTTPException(
                status_code=400,
                detail=f"threshold_value required for {threshold_data.threshold_type.upper()} threshold"
            )
    
    # Create threshold
    threshold = SensorThreshold(
        user_id=current_user.id,
        sensor_type=threshold_data.sensor_type,
        threshold_type=threshold_data.threshold_type,
        threshold_value=threshold_data.threshold_value,
        min_value=threshold_data.min_value,
        max_value=threshold_data.max_value,
        alert_name=threshold_data.alert_name,
        alert_description=threshold_data.alert_description,
        severity=threshold_data.severity,
        notification_channels=[str(ch.value) for ch in threshold_data.notification_channels],
        notification_message=threshold_data.notification_message,
        cooldown_minutes=threshold_data.cooldown_minutes,
        enabled=threshold_data.enabled
    )
    
    db.add(threshold)
    db.commit()
    db.refresh(threshold)
    
    return threshold


@router.get("/thresholds", response_model=ThresholdListResponse)
async def get_thresholds(
    sensor_type: Optional[str] = None,
    enabled: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all thresholds for current user"""
    
    query = db.query(SensorThreshold).filter(
        SensorThreshold.user_id == current_user.id
    )
    
    if sensor_type:
        query = query.filter(SensorThreshold.sensor_type == sensor_type)
    
    if enabled is not None:
        query = query.filter(SensorThreshold.enabled == enabled)
    
    thresholds = query.order_by(SensorThreshold.created_at.desc()).all()
    
    return ThresholdListResponse(
        success=True,
        thresholds=thresholds,
        total_count=len(thresholds)
    )


@router.get("/thresholds/{threshold_id}", response_model=ThresholdResponse)
async def get_threshold(
    threshold_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get specific threshold by ID"""
    
    threshold = db.query(SensorThreshold).filter(
        SensorThreshold.id == threshold_id,
        SensorThreshold.user_id == current_user.id
    ).first()
    
    if not threshold:
        raise HTTPException(status_code=404, detail="Threshold not found")
    
    return threshold


@router.put("/thresholds/{threshold_id}", response_model=ThresholdResponse)
async def update_threshold(
    threshold_id: int,
    threshold_data: ThresholdUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update existing threshold"""
    
    threshold = db.query(SensorThreshold).filter(
        SensorThreshold.id == threshold_id,
        SensorThreshold.user_id == current_user.id
    ).first()
    
    if not threshold:
        raise HTTPException(status_code=404, detail="Threshold not found")
    
    # Update fields
    update_data = threshold_data.model_dump(exclude_unset=True)
    
    # Convert notification channels enum to strings
    if "notification_channels" in update_data:
        update_data["notification_channels"] = [
            str(ch.value) for ch in update_data["notification_channels"]
        ]
    
    for field, value in update_data.items():
        setattr(threshold, field, value)
    
    threshold.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(threshold)
    
    return threshold


@router.delete("/thresholds/{threshold_id}")
async def delete_threshold(
    threshold_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a threshold"""
    
    threshold = db.query(SensorThreshold).filter(
        SensorThreshold.id == threshold_id,
        SensorThreshold.user_id == current_user.id
    ).first()
    
    if not threshold:
        raise HTTPException(status_code=404, detail="Threshold not found")
    
    db.delete(threshold)
    db.commit()
    
    return {"success": True, "message": "Threshold deleted successfully"}


@router.get("/thresholds/{threshold_id}/history", response_model=NotificationHistoryResponse)
async def get_threshold_history(
    threshold_id: int,
    limit: int = 20,
    skip: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get notification history for specific threshold"""
    
    # Verify threshold belongs to user
    threshold = db.query(SensorThreshold).filter(
        SensorThreshold.id == threshold_id,
        SensorThreshold.user_id == current_user.id
    ).first()
    
    if not threshold:
        raise HTTPException(status_code=404, detail="Threshold not found")
    
    monitor = get_threshold_monitor(db)
    notifications, total_count = monitor.get_notification_history(
        user_id=current_user.id,
        threshold_id=threshold_id,
        limit=limit,
        skip=skip
    )
    
    return NotificationHistoryResponse(
        success=True,
        notifications=notifications,
        total_count=total_count
    )


@router.get("/notifications/history", response_model=NotificationHistoryResponse)
async def get_all_notifications(
    limit: int = 20,
    skip: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all notification history for current user"""
    
    monitor = get_threshold_monitor(db)
    notifications, total_count = monitor.get_notification_history(
        user_id=current_user.id,
        limit=limit,
        skip=skip
    )
    
    return NotificationHistoryResponse(
        success=True,
        notifications=notifications,
        total_count=total_count
    )


@router.get("/summary", response_model=ThresholdSummary)
async def get_threshold_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get summary of threshold status"""
    
    monitor = get_threshold_monitor(db)
    summary = monitor.get_threshold_summary(current_user.id)
    
    return summary


@router.get("/current-readings", response_model=CurrentSensorReadings)
async def get_current_readings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get latest sensor readings"""
    
    # Get most recent sensor data (within last hour)
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    
    latest_data = db.query(SensorData).filter(
        SensorData.received_at >= one_hour_ago
    ).order_by(SensorData.received_at.desc()).first()
    
    if not latest_data:
        return CurrentSensorReadings()
    
    # Calculate heat index if not available but temp and humidity are
    heat_index = latest_data.heat_index
    if heat_index is None and latest_data.temperature and latest_data.humidity:
        heat_index = latest_data.temperature + (0.348 * latest_data.humidity) - 4.25
    
    return CurrentSensorReadings(
        temperature=latest_data.temperature,
        humidity=latest_data.humidity,
        soil_moisture=latest_data.soil_moisture,
        water_level=latest_data.water_level,
        heat_index=heat_index,
        last_updated=latest_data.received_at
    )

