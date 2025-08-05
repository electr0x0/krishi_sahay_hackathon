from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import random

from app.database import get_db
from app.models.sensor import SensorConfig, SensorData
from app.models.user import User
from app.schemas.sensor import (
    SensorConfigCreate, SensorConfigUpdate, SensorConfig as SensorConfigSchema,
    SensorDataCreate, SensorData as SensorDataSchema, SensorDataBatch,
    SensorAlert, SensorSummary
)
from app.auth.dependencies import get_current_user

router = APIRouter()

# Dummy data generators for testing
def generate_dht22_data():
    """Generate dummy DHT22 (temperature & humidity) data"""
    return {
        "temperature": round(random.uniform(15, 35), 1),
        "humidity": round(random.uniform(40, 90), 1)
    }

def generate_gy30_data():
    """Generate dummy GY-30 (light sensor) data"""
    return {
        "light_intensity": round(random.uniform(0, 100000), 1)  # Lux
    }

def generate_soil_moisture_data():
    """Generate dummy soil moisture sensor data"""
    return {
        "soil_moisture": round(random.uniform(20, 80), 1),  # Percentage
        "soil_ph": round(random.uniform(5.5, 8.0), 1)
    }

def generate_water_level_data():
    """Generate dummy water level sensor data"""
    return {
        "water_level": round(random.uniform(10, 100), 1),  # Percentage
        "water_flow_rate": round(random.uniform(0, 10), 2)  # L/min
    }

@router.post("/sensors", response_model=SensorConfigSchema)
async def create_sensor_config(
    sensor_data: SensorConfigCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new sensor configuration"""
    
    # Check if sensor_id already exists
    existing_sensor = db.query(SensorConfig).filter(
        SensorConfig.sensor_id == sensor_data.sensor_id
    ).first()
    
    if existing_sensor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sensor with this ID already exists"
        )
    
    # Create sensor config
    new_sensor = SensorConfig(
        user_id=current_user.id,
        sensor_id=sensor_data.sensor_id,
        sensor_name=sensor_data.sensor_name,
        sensor_type=sensor_data.sensor_type,
        farm_id=sensor_data.farm_id,
        location_description=sensor_data.location_description,
        latitude=sensor_data.latitude,
        longitude=sensor_data.longitude,
        elevation=sensor_data.elevation,
        update_interval=sensor_data.update_interval,
        alert_thresholds=sensor_data.alert_thresholds,
        is_active=True
    )
    
    db.add(new_sensor)
    db.commit()
    db.refresh(new_sensor)
    
    return new_sensor

@router.get("/sensors", response_model=List[SensorConfigSchema])
async def get_user_sensors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    is_active: Optional[bool] = None
):
    """Get all sensors for current user"""
    
    query = db.query(SensorConfig).filter(SensorConfig.user_id == current_user.id)
    
    if is_active is not None:
        query = query.filter(SensorConfig.is_active == is_active)
    
    sensors = query.all()
    return sensors

@router.get("/sensors/{sensor_id}", response_model=SensorConfigSchema)
async def get_sensor_config(
    sensor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific sensor configuration"""
    
    sensor = db.query(SensorConfig).filter(
        SensorConfig.sensor_id == sensor_id,
        SensorConfig.user_id == current_user.id
    ).first()
    
    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )
    
    return sensor

@router.put("/sensors/{sensor_id}", response_model=SensorConfigSchema)
async def update_sensor_config(
    sensor_id: str,
    update_data: SensorConfigUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update sensor configuration"""
    
    sensor = db.query(SensorConfig).filter(
        SensorConfig.sensor_id == sensor_id,
        SensorConfig.user_id == current_user.id
    ).first()
    
    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )
    
    # Update fields
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(sensor, field, value)
    
    sensor.updated_at = datetime.now()
    db.commit()
    db.refresh(sensor)
    
    return sensor

@router.delete("/sensors/{sensor_id}")
async def delete_sensor_config(
    sensor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete sensor configuration"""
    
    sensor = db.query(SensorConfig).filter(
        SensorConfig.sensor_id == sensor_id,
        SensorConfig.user_id == current_user.id
    ).first()
    
    if not sensor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )
    
    db.delete(sensor)
    db.commit()
    
    return {"message": "Sensor deleted successfully"}

@router.post("/sensors/{sensor_id}/data", response_model=SensorDataSchema)
async def submit_sensor_data(
    sensor_id: str,
    sensor_data: SensorDataCreate,
    db: Session = Depends(get_db)
):
    """Submit new sensor data (called by IoT devices)"""
    
    # Find sensor config
    sensor_config = db.query(SensorConfig).filter(
        SensorConfig.sensor_id == sensor_id,
        SensorConfig.is_active == True
    ).first()
    
    if not sensor_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active sensor not found"
        )
    
    # Create sensor data entry
    new_data = SensorData(
        sensor_config_id=sensor_config.id,
        temperature=sensor_data.temperature,
        humidity=sensor_data.humidity,
        light_intensity=sensor_data.light_intensity,
        soil_moisture=sensor_data.soil_moisture,
        soil_ph=sensor_data.soil_ph,
        water_level=sensor_data.water_level,
        water_flow_rate=sensor_data.water_flow_rate,
        atmospheric_pressure=sensor_data.atmospheric_pressure,
        uv_index=sensor_data.uv_index,
        battery_level=sensor_data.battery_level,
        signal_strength=sensor_data.signal_strength,
        device_status=sensor_data.device_status,
        data_quality=sensor_data.data_quality,
        error_message=sensor_data.error_message,
        recorded_at=sensor_data.recorded_at,
        received_at=datetime.now()
    )
    
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    
    return new_data

@router.get("/sensors/{sensor_id}/data", response_model=List[SensorDataSchema])
async def get_sensor_data(
    sensor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    hours: int = 24,
    limit: int = 100
):
    """Get sensor data for specific time period"""
    
    # Verify sensor ownership
    sensor_config = db.query(SensorConfig).filter(
        SensorConfig.sensor_id == sensor_id,
        SensorConfig.user_id == current_user.id
    ).first()
    
    if not sensor_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )
    
    # Get data for specified time period
    start_time = datetime.now() - timedelta(hours=hours)
    
    data = db.query(SensorData).filter(
        SensorData.sensor_config_id == sensor_config.id,
        SensorData.recorded_at >= start_time
    ).order_by(SensorData.recorded_at.desc()).limit(limit).all()
    
    return data

@router.get("/sensors/{sensor_id}/latest", response_model=SensorDataSchema)
async def get_latest_sensor_data(
    sensor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get latest sensor data"""
    
    # Verify sensor ownership
    sensor_config = db.query(SensorConfig).filter(
        SensorConfig.sensor_id == sensor_id,
        SensorConfig.user_id == current_user.id
    ).first()
    
    if not sensor_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )
    
    # Get latest data
    latest_data = db.query(SensorData).filter(
        SensorData.sensor_config_id == sensor_config.id
    ).order_by(SensorData.recorded_at.desc()).first()
    
    if not latest_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No data found for this sensor"
        )
    
    return latest_data

@router.get("/sensors/{sensor_id}/summary", response_model=SensorSummary)
async def get_sensor_summary(
    sensor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sensor summary with latest data and statistics"""
    
    # Verify sensor ownership
    sensor_config = db.query(SensorConfig).filter(
        SensorConfig.sensor_id == sensor_id,
        SensorConfig.user_id == current_user.id
    ).first()
    
    if not sensor_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )
    
    # Get latest data
    latest_data = db.query(SensorData).filter(
        SensorData.sensor_config_id == sensor_config.id
    ).order_by(SensorData.recorded_at.desc()).first()
    
    # Get data count for last 24 hours
    start_time = datetime.now() - timedelta(hours=24)
    data_count_24h = db.query(SensorData).filter(
        SensorData.sensor_config_id == sensor_config.id,
        SensorData.recorded_at >= start_time
    ).count()
    
    # Get last online time
    last_online = db.query(SensorData).filter(
        SensorData.sensor_config_id == sensor_config.id,
        SensorData.device_status == "online"
    ).order_by(SensorData.recorded_at.desc()).first()
    
    return SensorSummary(
        sensor_config=sensor_config,
        latest_data=latest_data,
        data_count_24h=data_count_24h,
        last_online=last_online.recorded_at if last_online else None,
        alerts_count=0  # TODO: Implement alerts counting
    )

# Dummy routes for testing IoT integration
@router.post("/sensors/{sensor_id}/simulate", response_model=SensorDataSchema)
async def simulate_sensor_data(
    sensor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and submit dummy sensor data for testing"""
    
    # Verify sensor ownership
    sensor_config = db.query(SensorConfig).filter(
        SensorConfig.sensor_id == sensor_id,
        SensorConfig.user_id == current_user.id
    ).first()
    
    if not sensor_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor not found"
        )
    
    # Generate dummy data based on sensor type
    dummy_data = {
        "sensor_config_id": sensor_config.id,
        "recorded_at": datetime.now()
    }
    
    if sensor_config.sensor_type == "DHT22":
        dummy_data.update(generate_dht22_data())
    elif sensor_config.sensor_type == "GY30":
        dummy_data.update(generate_gy30_data())
    elif sensor_config.sensor_type == "SOIL_MOISTURE":
        dummy_data.update(generate_soil_moisture_data())
    elif sensor_config.sensor_type == "WATER_LEVEL":
        dummy_data.update(generate_water_level_data())
    
    # Add common data
    dummy_data.update({
        "battery_level": round(random.uniform(20, 100), 1),
        "signal_strength": round(random.uniform(-80, -30), 1),
        "device_status": "online",
        "data_quality": "good"
    })
    
    # Create sensor data entry
    new_data = SensorData(**dummy_data, received_at=datetime.now())
    
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    
    return new_data

@router.get("/dashboard/sensors", response_model=List[SensorSummary])
async def get_dashboard_sensors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sensor summaries for dashboard"""
    
    sensors = db.query(SensorConfig).filter(
        SensorConfig.user_id == current_user.id,
        SensorConfig.is_active == True
    ).all()
    
    summaries = []
    for sensor in sensors:
        # Get latest data
        latest_data = db.query(SensorData).filter(
            SensorData.sensor_config_id == sensor.id
        ).order_by(SensorData.recorded_at.desc()).first()
        
        # Get data count for last 24 hours
        start_time = datetime.now() - timedelta(hours=24)
        data_count_24h = db.query(SensorData).filter(
            SensorData.sensor_config_id == sensor.id,
            SensorData.recorded_at >= start_time
        ).count()
        
        summaries.append(SensorSummary(
            sensor_config=sensor,
            latest_data=latest_data,
            data_count_24h=data_count_24h,
            last_online=latest_data.recorded_at if latest_data else None,
            alerts_count=0
        ))
    
    return summaries