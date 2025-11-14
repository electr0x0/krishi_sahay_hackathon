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
    
    # YOLO Detection results
    detections = Column(JSON)  # Store YOLO detection results as JSON
    detection_count = Column(Integer, default=0)
    
    # Gemini AI Analysis (NEW)
    growth_stage = Column(String)  # বৃদ্ধির পর্যায়
    growth_stage_en = Column(String)  # Growth stage in English
    plant_health_score = Column(Float)  # 0-100 health score
    ai_disease_analysis = Column(Text)  # Detailed disease analysis in Bengali
    ai_disease_analysis_en = Column(Text)  # Detailed disease analysis in English
    treatment_recommendations = Column(Text)  # Treatment suggestions in Bengali
    treatment_recommendations_en = Column(Text)  # Treatment suggestions in English
    preventive_measures = Column(Text)  # Preventive measures in Bengali
    preventive_measures_en = Column(Text)  # Preventive measures in English
    expected_recovery_time = Column(String)  # Expected recovery timeline
    severity_assessment = Column(String)  # Overall severity from AI
    additional_observations = Column(Text)  # Any additional AI observations
    gemini_processing_time = Column(Float)  # Time taken for Gemini analysis
    
    # Processing info
    processing_time = Column(Float)  # Total processing time (YOLO + Gemini)
    yolo_processing_time = Column(Float)  # Time taken for YOLO detection
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
