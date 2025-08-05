from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class GenderEnum(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class EducationEnum(str, Enum):
    none = "none"
    primary = "primary"
    secondary = "secondary"
    higher = "higher"

class FarmingTypeEnum(str, Enum):
    organic = "organic"
    conventional = "conventional"
    mixed = "mixed"

class UserBase(BaseModel):
    email: EmailStr
    phone: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[GenderEnum] = None
    education_level: Optional[EducationEnum] = None
    farming_experience: Optional[int] = None
    
    # Location updates
    division: Optional[str] = None
    district: Optional[str] = None
    upazila: Optional[str] = None
    union_ward: Optional[str] = None
    village: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserProfile(BaseModel):
    id: int
    email: EmailStr
    phone: str
    full_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    education_level: Optional[str] = None
    farming_experience: Optional[int] = None
    profile_image: Optional[str] = None
    
    # Location
    division: Optional[str] = None
    district: Optional[str] = None
    upazila: Optional[str] = None
    union_ward: Optional[str] = None
    village: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Status
    is_active: bool
    is_verified: bool
    
    # Timestamps
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserPreferencesUpdate(BaseModel):
    preferred_language: Optional[str] = None
    voice_enabled: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    
    # Notification preferences
    weather_alerts: Optional[bool] = None
    market_alerts: Optional[bool] = None
    crop_alerts: Optional[bool] = None
    pest_alerts: Optional[bool] = None
    
    # Farming preferences
    farming_type: Optional[FarmingTypeEnum] = None
    primary_crops: Optional[List[str]] = None
    farming_scale: Optional[str] = None
    irrigation_type: Optional[str] = None
    
    # AI preferences
    ai_assistance_level: Optional[str] = None
    auto_suggestions: Optional[bool] = None
    data_sharing: Optional[bool] = None

class UserPreferences(BaseModel):
    preferred_language: str = "bn"
    voice_enabled: bool = True
    sms_notifications: bool = True
    email_notifications: bool = True
    push_notifications: bool = True
    
    # Notification preferences
    weather_alerts: bool = True
    market_alerts: bool = True
    crop_alerts: bool = True
    pest_alerts: bool = True
    
    # Farming preferences
    farming_type: Optional[str] = None
    primary_crops: Optional[List[str]] = None
    farming_scale: Optional[str] = None
    irrigation_type: Optional[str] = None
    
    # AI preferences
    ai_assistance_level: str = "medium"
    auto_suggestions: bool = True
    data_sharing: bool = True
    
    class Config:
        from_attributes = True

class UserStats(BaseModel):
    total_farms: int
    total_crops: int
    active_alerts: int
    chat_sessions: int
    last_sensor_update: Optional[datetime] = None