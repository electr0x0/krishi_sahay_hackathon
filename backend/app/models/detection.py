from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class DetectionHistory(Base):
    __tablename__ = "detection_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # File paths
    original_image_path = Column(String, nullable=False)
    processed_image_path = Column(String, nullable=False)
    
    # Detection results
    detections = Column(JSON)  # Store detection results as JSON
    detection_count = Column(Integer, default=0)
    
    # Processing info
    processing_time = Column(Float)
    confidence_threshold = Column(Float, default=0.25)
    
    # Status
    success = Column(Boolean, default=True)
    error_message = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="detection_history")


class DetectionAlert(Base):
    __tablename__ = "detection_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    detection_history_id = Column(Integer, ForeignKey("detection_history.id"), nullable=False)
    
    # Alert Information
    alert_type = Column(String, nullable=False)  # disease_detected, multiple_diseases, severe_disease
    severity = Column(String, default="medium")  # low, medium, high, urgent
    disease_names = Column(JSON)  # List of detected disease names
    confidence_scores = Column(JSON)  # List of confidence scores
    
    # Alert Content
    title_bn = Column(String)
    title_en = Column(String)
    message_bn = Column(Text)
    message_en = Column(Text)
    
    # Recommendations
    recommendations_bn = Column(Text)
    recommendations_en = Column(Text)
    
    # Status
    is_read = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
    dismissed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User")
    detection_history = relationship("DetectionHistory")
