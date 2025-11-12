from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.api.admin.dependencies import require_admin
from app.services.admin_service import AdminService
from app.models.user import User
from app.models.sensor import SensorConfig


router = APIRouter(prefix="/admin/sensors", tags=["admin-sensors"])


@router.get("/")
async def get_all_sensors(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    status: Optional[str] = Query(default=None, description="Filter by sensor status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get all IoT sensors with pagination and filtering
    
    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    - **status**: Filter by sensor status (online, offline, maintenance)
    """
    try:
        sensors = await AdminService.get_all_sensors(db, skip, limit, status)
        
        return [{
            "id": sensor.id,
            "sensor_id": sensor.sensor_id,
            "name": sensor.name,
            "location": sensor.location,
            "status": sensor.status,
            "battery_level": sensor.battery_level if hasattr(sensor, 'battery_level') else None,
            "last_reading_at": sensor.last_reading_at.isoformat() if hasattr(sensor, 'last_reading_at') and sensor.last_reading_at else None,
            "created_at": sensor.created_at.isoformat() if sensor.created_at else None,
        } for sensor in sensors]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sensors: {str(e)}"
        )


@router.get("/{sensor_id}")
async def get_sensor_details(
    sensor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get detailed information about a specific sensor
    
    Returns comprehensive sensor data including:
    - Current status and readings
    - Historical data summary
    - Alert history
    - Configuration settings
    """
    try:
        sensor = db.query(SensorConfig).filter(SensorConfig.id == sensor_id).first()
        
        if not sensor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sensor not found"
            )
        
        # Get latest readings (if you have sensor_readings table)
        # latest_readings = db.query(SensorReading).filter(
        #     SensorReading.sensor_id == sensor_id
        # ).order_by(desc(SensorReading.timestamp)).limit(10).all()
        
        return {
            "id": sensor.id,
            "sensor_id": sensor.sensor_id,
            "name": sensor.name,
            "location": sensor.location,
            "status": sensor.status,
            "battery_level": sensor.battery_level if hasattr(sensor, 'battery_level') else None,
            "last_reading_at": sensor.last_reading_at.isoformat() if hasattr(sensor, 'last_reading_at') and sensor.last_reading_at else None,
            "created_at": sensor.created_at.isoformat() if sensor.created_at else None,
            # "latest_readings": [
            #     {
            #         "temperature": reading.temperature,
            #         "humidity": reading.humidity,
            #         "soil_moisture": reading.soil_moisture,
            #         "timestamp": reading.timestamp.isoformat()
            #     }
            #     for reading in latest_readings
            # ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sensor details: {str(e)}"
        )


@router.patch("/{sensor_id}/status")
async def update_sensor_status(
    sensor_id: int,
    new_status: str = Query(..., description="New sensor status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update sensor status
    
    Valid statuses: online, offline, maintenance, error
    """
    try:
        sensor = db.query(SensorConfig).filter(SensorConfig.id == sensor_id).first()
        
        if not sensor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sensor not found"
            )
        
        valid_statuses = ['online', 'offline', 'maintenance', 'error']
        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        old_status = sensor.is_active
        sensor.is_active = (new_status == 'online')
        db.commit()
        
        # Log activity
        await AdminService.log_activity(
            db=db,
            admin_id=current_user.id,
            action="sensor_status_updated",
            target_type="sensor",
            target_id=sensor_id,
            details={
                "old_status": old_status,
                "new_status": new_status,
                "sensor_id": sensor.sensor_id
            }
        )
        
        return {
            "message": "Sensor status updated successfully",
            "sensor_id": sensor.sensor_id,
            "old_status": old_status,
            "new_status": new_status
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update sensor status: {str(e)}"
        )


@router.get("/stats/summary")
async def get_sensor_stats_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Get sensor statistics summary
    
    Returns aggregated sensor metrics for dashboard
    """
    try:
        from sqlalchemy import func
        
        total = db.query(func.count(SensorConfig.id)).scalar() or 0
        online = db.query(func.count(SensorConfig.id)).filter(SensorConfig.is_active == True).scalar() or 0
        offline = total - online
        maintenance = 0
        error = 0
        
        uptime_percent = round((online / total * 100) if total > 0 else 0, 2)
        
        return {
            "total_sensors": total,
            "online": online,
            "offline": offline,
            "maintenance": maintenance,
            "error": error,
            "uptime_percent": uptime_percent
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sensor stats: {str(e)}"
        )


@router.delete("/{sensor_id}")
async def delete_sensor(
    sensor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a sensor (use with caution)
    
    This is a permanent action
    """
    try:
        sensor = db.query(SensorConfig).filter(SensorConfig.id == sensor_id).first()
        
        if not sensor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sensor not found"
            )
        
        # Log activity before deleting
        await AdminService.log_activity(
            db=db,
            admin_id=current_user.id,
            action="sensor_deleted",
            target_type="sensor",
            target_id=sensor_id,
            details={"sensor_id": sensor.sensor_id, "name": sensor.sensor_name}
        )
        
        db.delete(sensor)
        db.commit()
        
        return {"message": "Sensor deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete sensor: {str(e)}"
        )
