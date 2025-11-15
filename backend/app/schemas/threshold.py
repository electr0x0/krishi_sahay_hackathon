"""
Threshold API Schemas

Pydantic models for threshold and notification APIs.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ThresholdTypeEnum(str, Enum):
    """Threshold types"""
    ABOVE = "above"
    BELOW = "below"
    RANGE = "range"


class ThresholdStatusEnum(str, Enum):
    """Threshold status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    TRIGGERED = "triggered"


class NotificationChannelEnum(str, Enum):
    """Notification channels"""
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"


class SeverityEnum(str, Enum):
    """Alert severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# Request Schemas

class ThresholdCreate(BaseModel):
    """Create new threshold"""
    sensor_type: str = Field(..., description="temperature, humidity, soil_moisture, water_level")
    threshold_type: ThresholdTypeEnum
    
    # Threshold values
    threshold_value: Optional[float] = None  # For ABOVE/BELOW
    min_value: Optional[float] = None  # For RANGE
    max_value: Optional[float] = None  # For RANGE
    
    # Configuration
    alert_name: str = Field(..., min_length=1, max_length=100)
    alert_description: Optional[str] = None
    severity: SeverityEnum = SeverityEnum.MEDIUM
    
    # Notification settings
    notification_channels: List[NotificationChannelEnum] = [NotificationChannelEnum.WHATSAPP]
    notification_message: Optional[str] = None
    
    # Cooldown
    cooldown_minutes: int = Field(default=60, ge=5, le=1440)  # 5 min to 24 hours
    enabled: bool = True


class ThresholdUpdate(BaseModel):
    """Update existing threshold"""
    threshold_type: Optional[ThresholdTypeEnum] = None
    threshold_value: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    
    alert_name: Optional[str] = None
    alert_description: Optional[str] = None
    severity: Optional[SeverityEnum] = None
    
    notification_channels: Optional[List[NotificationChannelEnum]] = None
    notification_message: Optional[str] = None
    cooldown_minutes: Optional[int] = None
    enabled: Optional[bool] = None


# Response Schemas

class ThresholdResponse(BaseModel):
    """Threshold response"""
    id: int
    user_id: int
    sensor_type: str
    threshold_type: str
    
    threshold_value: Optional[float]
    min_value: Optional[float]
    max_value: Optional[float]
    
    alert_name: str
    alert_description: Optional[str]
    severity: str
    
    notification_channels: List[str]
    notification_message: Optional[str]
    cooldown_minutes: int
    enabled: bool
    
    status: str
    trigger_count: int
    last_triggered_at: Optional[datetime]
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ThresholdListResponse(BaseModel):
    """List of thresholds"""
    success: bool = True
    thresholds: List[ThresholdResponse]
    total_count: int


class NotificationHistoryItem(BaseModel):
    """Notification history item"""
    id: int
    user_id: int
    threshold_id: int
    
    sensor_type: str
    sensor_value: float
    threshold_value: Optional[float]
    threshold_type: str
    
    channels: List[str]
    message_sent: str
    delivery_status: Dict[str, str]
    
    twilio_message_sid: Optional[str]
    success: bool
    error_message: Optional[str]
    
    created_at: datetime
    
    # Additional info
    threshold: Optional[ThresholdResponse] = None
    
    class Config:
        from_attributes = True


class NotificationHistoryResponse(BaseModel):
    """Notification history response"""
    success: bool = True
    notifications: List[NotificationHistoryItem]
    total_count: int


class ThresholdCheckResult(BaseModel):
    """Result of threshold check"""
    threshold_id: int
    alert_name: str
    sensor_type: str
    is_triggered: bool
    sensor_value: float
    threshold_value: Optional[float]
    notification_sent: bool
    reason: Optional[str] = None  # Why notification wasn't sent (cooldown, disabled, etc.)


class CurrentSensorReadings(BaseModel):
    """Current sensor readings for dashboard"""
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    soil_moisture: Optional[float] = None
    water_level: Optional[float] = None
    heat_index: Optional[float] = None
    last_updated: Optional[datetime] = None


class ThresholdSummary(BaseModel):
    """Summary of threshold status"""
    total_thresholds: int
    active_thresholds: int
    triggered_thresholds: int
    total_notifications_sent: int
    last_24h_notifications: int

