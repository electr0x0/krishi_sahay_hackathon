from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Farm(Base):
    __tablename__ = "farms"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Farm Basic Information
    name = Column(String, nullable=False)
    description = Column(Text)
    farm_type = Column(String)  # crop, livestock, mixed, aquaculture
    
    # Size & Location
    total_area = Column(Float)  # in acres
    cultivable_area = Column(Float)  # in acres
    latitude = Column(Float)
    longitude = Column(Float)
    elevation = Column(Float)  # meters above sea level
    
    # Address
    division = Column(String)
    district = Column(String)
    upazila = Column(String)
    union_ward = Column(String)
    village = Column(String)
    detailed_address = Column(Text)
    
    # Farm Characteristics
    soil_type = Column(String)  # clay, loam, sand, silt
    irrigation_source = Column(String)  # river, tube_well, pond, rain_fed
    water_source_distance = Column(Float)  # meters
    
    # Infrastructure
    has_electricity = Column(Boolean, default=False)
    has_storage = Column(Boolean, default=False)
    has_processing_unit = Column(Boolean, default=False)
    transportation_access = Column(String)  # good, moderate, poor
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="farms")
    crops = relationship("Crop", back_populates="farm")
    sensor_configs = relationship("SensorConfig", back_populates="farm")

class Crop(Base):
    __tablename__ = "crops"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"))
    
    # Crop Information
    name_bn = Column(String, nullable=False)  # ধান, গম, ভুট্টা
    name_en = Column(String, nullable=False)  # rice, wheat, corn
    variety = Column(String)  # BRRI dhan29, Binadhan-7
    category = Column(String)  # cereal, vegetable, fruit, cash_crop
    
    # Cultivation Details
    planting_date = Column(DateTime(timezone=True))
    expected_harvest_date = Column(DateTime(timezone=True))
    actual_harvest_date = Column(DateTime(timezone=True))
    
    # Area & Production
    cultivated_area = Column(Float)  # in acres
    expected_yield = Column(Float)  # in kg
    actual_yield = Column(Float)  # in kg
    
    # Growth Stage
    current_stage = Column(String)  # seedling, vegetative, flowering, fruiting, maturity
    growth_percentage = Column(Float, default=0.0)  # 0-100
    
    # Health Status
    health_status = Column(String, default="healthy")  # healthy, stressed, diseased
    pest_issues = Column(Text)  # JSON array of pest problems
    disease_issues = Column(Text)  # JSON array of diseases
    
    # Management
    irrigation_schedule = Column(Text)  # JSON with irrigation plan
    fertilizer_schedule = Column(Text)  # JSON with fertilizer plan
    pesticide_applications = Column(Text)  # JSON with pesticide records
    
    # Economic
    investment_cost = Column(Float)  # Total investment in BDT
    expected_revenue = Column(Float)  # Expected revenue in BDT
    actual_revenue = Column(Float)  # Actual revenue in BDT
    
    # Status
    is_active = Column(Boolean, default=True)
    is_harvested = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    farm = relationship("Farm", back_populates="crops")
    calendar_entries = relationship("CropCalendar", back_populates="crop")

class CropCalendar(Base):
    __tablename__ = "crop_calendar"
    
    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"))
    
    # Activity Information
    activity_type = Column(String, nullable=False)  # planting, irrigation, fertilizer, pesticide, harvest
    activity_name_bn = Column(String, nullable=False)
    activity_name_en = Column(String, nullable=False)
    description = Column(Text)
    
    # Scheduling
    scheduled_date = Column(DateTime(timezone=True))
    completed_date = Column(DateTime(timezone=True))
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String)  # daily, weekly, monthly
    
    # Status
    status = Column(String, default="pending")  # pending, in_progress, completed, cancelled
    priority = Column(String, default="medium")  # low, medium, high, urgent
    
    # Resources
    labor_required = Column(Integer)  # number of people
    estimated_cost = Column(Float)  # in BDT
    actual_cost = Column(Float)  # in BDT
    materials_needed = Column(Text)  # JSON array of materials
    
    # Weather Dependency
    weather_dependent = Column(Boolean, default=True)
    ideal_weather_conditions = Column(Text)  # JSON with weather requirements
    
    # Notifications
    reminder_sent = Column(Boolean, default=False)
    notification_time = Column(DateTime(timezone=True))
    
    # Notes
    notes = Column(Text)
    completion_notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    crop = relationship("Crop", back_populates="calendar_entries")