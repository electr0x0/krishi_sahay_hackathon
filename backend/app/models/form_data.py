from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from typing import TYPE_CHECKING

class FarmData(Base):
    __tablename__ = "farm_data"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Information
    farmer_name = Column(String, index=True, nullable=False)
    farm_name = Column(String, nullable=True)
    description = Column(Text)
    farm_type = Column(String, default="crop")  # crop, livestock, mixed, aquaculture
    
    # Location Information
    division = Column(String, default="Unknown")
    district_new = Column(String, default="Unknown")  # Main district field
    upazila = Column(String, default="Unknown")
    union_ward = Column(String)
    village = Column(String)
    detailed_address = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    elevation = Column(Float)
    
    # Farm Size & Characteristics
    total_area = Column(Float, default=1.0)  # in acres
    cultivable_area = Column(Float)  # in acres
    soil_type = Column(String)  # clay, loam, sand, silt
    irrigation_source = Column(String)  # river, tube_well, pond, rain_fed
    water_source_distance = Column(Float)  # meters
    
    # Infrastructure
    has_electricity = Column(Boolean, default=False)
    has_storage = Column(Boolean, default=False)
    has_processing_unit = Column(Boolean, default=False)
    transportation_access = Column(String)  # good, moderate, poor
    
    # Experience & Production
    farming_experience = Column(String)  # 1-5 years, 6-10 years, etc.
    successful_crops = Column(Integer)  # Number of successful crops
    yearly_production = Column(Float)  # Yearly production in kg
    
    # Legacy fields (for backward compatibility)
    location = Column(String, nullable=True)  # Legacy location field
    crop_type = Column(String, nullable=True)  # Legacy crop type
    total_amount = Column(String)  # Legacy total amount
    successful_result = Column(Integer)  # Legacy successful result
    todays_work = Column(Integer)  # Tasks completed today
    monthly_income = Column(Float)  # Monthly income in BDT
    
    # Current Activity
    current_crops = Column(String)  # Currently growing crops
    
    # Status & Metadata
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Relationships
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="farm_data")
    
    # Timestamps
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def to_dict(self):
        """Convert FarmData instance to dictionary for AI context"""
        return {
            "id": self.id,
            "farmer_name": self.farmer_name,
            "farm_name": self.farm_name,
            "description": self.description,
            "farm_type": self.farm_type,
            "location": {
                "division": self.division,
                "district": self.district_new,
                "upazila": self.upazila,
                "union_ward": self.union_ward,
                "village": self.village,
                "detailed_address": self.detailed_address,
                "latitude": self.latitude,
                "longitude": self.longitude,
                "elevation": self.elevation
            },
            "farm_characteristics": {
                "total_area": self.total_area,
                "cultivable_area": self.cultivable_area,
                "soil_type": self.soil_type,
                "irrigation_source": self.irrigation_source,
                "water_source_distance": self.water_source_distance
            },
            "infrastructure": {
                "has_electricity": self.has_electricity,
                "has_storage": self.has_storage,
                "has_processing_unit": self.has_processing_unit,
                "transportation_access": self.transportation_access
            },
            "experience": {
                "farming_experience": self.farming_experience,
                "successful_crops": self.successful_crops,
                "yearly_production": self.yearly_production,
                "monthly_income": self.monthly_income
            },
            "current_activity": {
                "current_crops": self.current_crops,
                "todays_work": self.todays_work
            },
            "status": {
                "is_active": self.is_active,
                "is_verified": self.is_verified
            },
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }