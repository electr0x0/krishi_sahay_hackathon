from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class SensorConfig(Base):
    __tablename__ = "sensor_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    farm_id = Column(Integer, ForeignKey("farms.id"))
    
    # Sensor Information
    sensor_id = Column(String, unique=True, index=True)  # Unique identifier for IoT device
    sensor_name = Column(String)  # User-friendly name
    sensor_type = Column(String)  # DHT22, GY30, SOIL_MOISTURE, WATER_LEVEL
    location_description = Column(String)  # "Field A, North Corner"
    
    # Position
    latitude = Column(Float)
    longitude = Column(Float)
    elevation = Column(Float)  # meters above sea level
    
    # Configuration
    is_active = Column(Boolean, default=True)
    update_interval = Column(Integer, default=300)  # seconds
    alert_thresholds = Column(Text)  # JSON with min/max values
    
    # Calibration
    calibration_offset = Column(Float, default=0.0)
    last_calibrated = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    farm = relationship("Farm")
    sensor_data = relationship("SensorData", back_populates="sensor_config")

class SensorData(Base):
    __tablename__ = "sensor_data"
    
    id = Column(Integer, primary_key=True, index=True)
    sensor_config_id = Column(Integer, ForeignKey("sensor_configs.id"))
    
    # DHT22 Data (Temperature & Humidity)
    temperature = Column(Float)  # Celsius
    humidity = Column(Float)  # Percentage
    
    # GY-30 Data (Light Sensor)
    light_intensity = Column(Float)  # Lux
    
    # Soil Moisture Data
    soil_moisture = Column(Float)  # Percentage
    soil_ph = Column(Float)  # pH level
    
    # Water Level Data
    water_level = Column(Float)  # cm or percentage
    water_flow_rate = Column(Float)  # L/min
    
    # Environmental Data
    atmospheric_pressure = Column(Float)  # hPa
    uv_index = Column(Float)
    
    # Device Status
    battery_level = Column(Float)  # Percentage
    signal_strength = Column(Float)  # dBm
    device_status = Column(String, default="online")  # online, offline, error
    
    # Data Quality
    data_quality = Column(String, default="good")  # good, warning, error
    error_message = Column(Text)
    
    # Timestamps
    recorded_at = Column(DateTime(timezone=True))  # When sensor recorded
    received_at = Column(DateTime(timezone=True), server_default=func.now())  # When server received
    
    # Relationships
    sensor_config = relationship("SensorConfig", back_populates="sensor_data")