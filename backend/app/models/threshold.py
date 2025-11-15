"""
IoT Threshold and Notification Models

Models for user-defined sensor thresholds and notification history.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class ThresholdType(str, enum.Enum):
    """Types of threshold conditions"""
    ABOVE = "above"  # Trigger when value goes above threshold
    BELOW = "below"  # Trigger when value goes below threshold
    RANGE = "range"  # Trigger when value is outside range


class ThresholdStatus(str, enum.Enum):
    """Threshold status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRIGGERED = "triggered"  # Currently breached


class NotificationChannel(str, enum.Enum):
    """Notification delivery channels"""
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"


class SensorThreshold(Base):
    """User-defined thresholds for sensor monitoring"""
    __tablename__ = "sensor_thresholds"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Threshold configuration
    sensor_type = Column(String, nullable=False)  # temperature, humidity, soil_moisture, water_level
    threshold_type = Column(SQLEnum(ThresholdType), nullable=False)
    
    # Threshold values
    threshold_value = Column(Float)  # For ABOVE/BELOW
    min_value = Column(Float)  # For RANGE
    max_value = Column(Float)  # For RANGE
    
    # Notification settings
    notification_channels = Column(JSON)  # List of channels to send to
    notification_message = Column(String)  # Custom message template
    enabled = Column(Boolean, default=True)
    
    # Alert configuration
    alert_name = Column(String, nullable=False)  # User-friendly name
    alert_description = Column(String)
    severity = Column(String, default="medium")  # low, medium, high, critical
    
    # Cooldown to prevent spam
    cooldown_minutes = Column(Integer, default=60)  # Wait time before sending another alert
    last_triggered_at = Column(DateTime, nullable=True)
    
    # Status
    status = Column(SQLEnum(ThresholdStatus), default=ThresholdStatus.ACTIVE)
    trigger_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="sensor_thresholds")
    notification_history = relationship("ThresholdNotification", back_populates="threshold", cascade="all, delete-orphan")
    
    def is_triggered(self, sensor_value: float) -> bool:
        """Check if threshold is triggered by sensor value"""
        if not self.enabled or self.status == ThresholdStatus.INACTIVE:
            return False
        
        if self.threshold_type == ThresholdType.ABOVE:
            return sensor_value > self.threshold_value
        elif self.threshold_type == ThresholdType.BELOW:
            return sensor_value < self.threshold_value
        elif self.threshold_type == ThresholdType.RANGE:
            return sensor_value < self.min_value or sensor_value > self.max_value
        
        return False
    
    def can_send_notification(self) -> bool:
        """Check if cooldown period has passed"""
        if not self.last_triggered_at:
            return True
        
        cooldown_delta = datetime.utcnow() - self.last_triggered_at
        return cooldown_delta.total_seconds() >= (self.cooldown_minutes * 60)


class ThresholdNotification(Base):
    """History of threshold breach notifications"""
    __tablename__ = "threshold_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    threshold_id = Column(Integer, ForeignKey("sensor_thresholds.id"), nullable=False)
    sensor_data_id = Column(Integer, ForeignKey("sensor_data.id"), nullable=True)
    
    # Notification details
    sensor_type = Column(String, nullable=False)
    sensor_value = Column(Float, nullable=False)
    threshold_value = Column(Float)
    threshold_type = Column(String)
    
    # Delivery information
    channels = Column(JSON)  # Which channels were used
    message_sent = Column(String)  # The actual message sent
    delivery_status = Column(JSON)  # Status per channel {whatsapp: "sent", email: "failed"}
    
    # WhatsApp specific
    twilio_message_sid = Column(String, nullable=True)
    
    # Status
    success = Column(Boolean, default=True)
    error_message = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    threshold = relationship("SensorThreshold", back_populates="notification_history")
    sensor_data = relationship("SensorData")

