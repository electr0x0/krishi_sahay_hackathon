from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class DetectionRequest(BaseModel):
    file_name: str
    file_content: str  # base64 encoded image
    confidence_threshold: Optional[float] = Field(default=0.25, ge=0.0, le=1.0)

class DetectionItem(BaseModel):
    class_name: str
    original_class: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]
    severity: str

class DetectionResponse(BaseModel):
    success: bool
    message: str
    detection_id: Optional[int] = None
    detections: List[DetectionItem]
    detection_count: int
    original_image_url: str
    processed_image_url: str
    processing_time: float

class DetectionHistoryItem(BaseModel):
    id: int
    original_image_url: str
    processed_image_url: str
    detections: List[DetectionItem]
    detection_count: int
    processing_time: float
    confidence_threshold: float
    success: bool
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class DetectionHistoryResponse(BaseModel):
    success: bool
    history: List[DetectionHistoryItem]
    total_count: int


class DetectionAlertCreate(BaseModel):
    detection_history_id: int
    alert_type: str
    severity: str = "medium"
    disease_names: List[str]
    confidence_scores: List[float]
    title_bn: Optional[str] = None
    title_en: Optional[str] = None
    message_bn: Optional[str] = None
    message_en: Optional[str] = None
    recommendations_bn: Optional[str] = None
    recommendations_en: Optional[str] = None


class DetectionAlert(BaseModel):
    id: int
    user_id: int
    detection_history_id: int
    alert_type: str
    severity: str
    disease_names: List[str]
    confidence_scores: List[float]
    title_bn: Optional[str] = None
    title_en: Optional[str] = None
    message_bn: Optional[str] = None
    message_en: Optional[str] = None
    recommendations_bn: Optional[str] = None
    recommendations_en: Optional[str] = None
    is_read: bool
    is_dismissed: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    dismissed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DetectionAlertResponse(BaseModel):
    success: bool
    alerts: List[DetectionAlert]
    total_count: int
    unread_count: int
