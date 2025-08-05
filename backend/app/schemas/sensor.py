from pydantic import BaseModel, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class SensorTypeEnum(str, Enum):
    DHT22 = "DHT22"
    GY30 = "GY30"
    SOIL_MOISTURE = "SOIL_MOISTURE"
    WATER_LEVEL = "WATER_LEVEL"

class DeviceStatusEnum(str, Enum):
    online = "online"
    offline = "offline"
    error = "error"
    maintenance = "maintenance"

class DataQualityEnum(str, Enum):
    good = "good"
    warning = "warning"
    error = "error"

class SensorConfigCreate(BaseModel):
    sensor_id: str
    sensor_name: str
    sensor_type: SensorTypeEnum
    farm_id: int
    location_description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    elevation: Optional[float] = None
    update_interval: int = 300
    alert_thresholds: Optional[Dict[str, Any]] = None

class SensorConfigUpdate(BaseModel):
    sensor_name: Optional[str] = None
    location_description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    elevation: Optional[float] = None
    is_active: Optional[bool] = None
    update_interval: Optional[int] = None
    alert_thresholds: Optional[Dict[str, Any]] = None

class SensorConfig(BaseModel):
    id: int
    user_id: int
    farm_id: int
    sensor_id: str
    sensor_name: str
    sensor_type: str
    location_description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    elevation: Optional[float] = None
    is_active: bool
    update_interval: int
    alert_thresholds: Optional[Dict[str, Any]] = None
    calibration_offset: float
    last_calibrated: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SensorDataCreate(BaseModel):
    sensor_config_id: int
    
    # DHT22 data
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    
    # GY-30 data
    light_intensity: Optional[float] = None
    
    # Soil moisture data
    soil_moisture: Optional[float] = None
    soil_ph: Optional[float] = None
    
    # Water level data
    water_level: Optional[float] = None
    water_flow_rate: Optional[float] = None
    
    # Environmental data
    atmospheric_pressure: Optional[float] = None
    uv_index: Optional[float] = None
    
    # Device status
    battery_level: Optional[float] = None
    signal_strength: Optional[float] = None
    device_status: DeviceStatusEnum = DeviceStatusEnum.online
    
    # Data quality
    data_quality: DataQualityEnum = DataQualityEnum.good
    error_message: Optional[str] = None
    
    recorded_at: datetime

class SensorData(BaseModel):
    id: int
    sensor_config_id: int
    
    # Sensor readings
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    light_intensity: Optional[float] = None
    soil_moisture: Optional[float] = None
    soil_ph: Optional[float] = None
    water_level: Optional[float] = None
    water_flow_rate: Optional[float] = None
    atmospheric_pressure: Optional[float] = None
    uv_index: Optional[float] = None
    
    # Device status
    battery_level: Optional[float] = None
    signal_strength: Optional[float] = None
    device_status: str
    data_quality: str
    error_message: Optional[str] = None
    
    # Timestamps
    recorded_at: datetime
    received_at: datetime
    
    class Config:
        from_attributes = True

class SensorDataBatch(BaseModel):
    """For receiving multiple sensor readings at once"""
    sensor_id: str
    readings: List[SensorDataCreate]

class SensorAlert(BaseModel):
    sensor_id: str
    alert_type: str
    message: str
    severity: str
    value: float
    threshold: float
    timestamp: datetime

class SensorSummary(BaseModel):
    sensor_config: SensorConfig
    latest_data: Optional[SensorData] = None
    data_count_24h: int
    last_online: Optional[datetime] = None
    alerts_count: int