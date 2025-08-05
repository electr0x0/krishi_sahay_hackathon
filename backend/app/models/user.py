from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Profile Information
    age = Column(Integer)
    gender = Column(String)  # male, female, other
    education_level = Column(String)  # primary, secondary, higher, none
    farming_experience = Column(Integer)  # years
    profile_image = Column(String)  # file path
    
    # Location Information
    division = Column(String)  # Dhaka, Chittagong, etc.
    district = Column(String)
    upazila = Column(String)
    union_ward = Column(String)
    village = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Account Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    preferences = relationship("UserPreferences", back_populates="user", uselist=False)
    farms = relationship("Farm", back_populates="owner")
    chat_sessions = relationship("ChatSession", back_populates="user")

class UserPreferences(Base):
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Language & Communication
    preferred_language = Column(String, default="bn")  # bn, en
    voice_enabled = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    
    # Notification Preferences
    weather_alerts = Column(Boolean, default=True)
    market_alerts = Column(Boolean, default=True)
    crop_alerts = Column(Boolean, default=True)
    pest_alerts = Column(Boolean, default=True)
    
    # Farming Preferences
    farming_type = Column(String)  # organic, conventional, mixed
    primary_crops = Column(Text)  # JSON array of crops
    farming_scale = Column(String)  # small, medium, large
    irrigation_type = Column(String)  # manual, automatic, mixed
    
    # AI Preferences
    ai_assistance_level = Column(String, default="medium")  # basic, medium, advanced
    auto_suggestions = Column(Boolean, default=True)
    data_sharing = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="preferences")