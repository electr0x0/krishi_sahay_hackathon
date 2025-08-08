from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class FarmTypeEnum(str, Enum):
    crop = "crop"
    livestock = "livestock" 
    mixed = "mixed"
    aquaculture = "aquaculture"

class SoilTypeEnum(str, Enum):
    clay = "clay"
    loam = "loam"
    sand = "sand"
    silt = "silt"

class IrrigationSourceEnum(str, Enum):
    river = "river"
    tube_well = "tube_well"
    pond = "pond"
    rain_fed = "rain_fed"

class TransportationAccessEnum(str, Enum):
    good = "good"
    moderate = "moderate"
    poor = "poor"

class FarmingExperienceEnum(str, Enum):
    beginner = "১-৫ বছর"
    intermediate = "৬-১০ বছর"
    experienced = "১১-২০ বছর"
    expert = "২০+ বছর"

class FarmDataCreate(BaseModel):
    # Basic Information
    farmer_name: str = Field(..., alias='farmerName')
    farm_name: str = Field(..., alias='farmName')
    description: Optional[str] = None
    farm_type: FarmTypeEnum = Field(..., alias='farmType')
    
    # Location Information
    division: str
    district: str
    upazila: str
    union_ward: Optional[str] = Field(None, alias='unionWard')
    village: Optional[str] = None
    detailed_address: Optional[str] = Field(None, alias='detailedAddress')
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    elevation: Optional[float] = None
    
    # Farm Size & Characteristics
    total_area: float = Field(..., alias='totalArea', description="Total farm area in acres")
    cultivable_area: Optional[float] = Field(None, alias='cultivableArea', description="Cultivable area in acres")
    soil_type: Optional[SoilTypeEnum] = Field(None, alias='soilType')
    irrigation_source: Optional[IrrigationSourceEnum] = Field(None, alias='irrigationSource')
    water_source_distance: Optional[float] = Field(None, alias='waterSourceDistance', description="Distance to water source in meters")
    
    # Infrastructure
    has_electricity: bool = Field(False, alias='hasElectricity')
    has_storage: bool = Field(False, alias='hasStorage')
    has_processing_unit: bool = Field(False, alias='hasProcessingUnit')
    transportation_access: Optional[TransportationAccessEnum] = Field(None, alias='transportationAccess')
    
    # Experience & Production
    farming_experience: Optional[FarmingExperienceEnum] = Field(None, alias='farmingExperience')
    successful_crops: Optional[int] = Field(None, alias='successfulCrops', description="Number of successful crops")
    monthly_income: Optional[float] = Field(None, alias='monthlyIncome', description="Monthly income in BDT")
    yearly_production: Optional[float] = Field(None, alias='yearlyProduction', description="Yearly production in kg")
    
    # Current Activity
    current_crops: Optional[str] = Field(None, alias='currentCrops', description="Currently growing crops")
    todays_work: Optional[int] = Field(None, alias='todaysWork', description="Tasks completed today")

    class Config:
        from_attributes = True
        populate_by_name = True

class FarmDataUpdate(BaseModel):
    # Basic Information
    farmer_name: Optional[str] = Field(None, alias='farmerName')
    farm_name: Optional[str] = Field(None, alias='farmName')
    description: Optional[str] = None
    farm_type: Optional[FarmTypeEnum] = Field(None, alias='farmType')
    
    # Location Information
    division: Optional[str] = None
    district: Optional[str] = None
    upazila: Optional[str] = None
    union_ward: Optional[str] = Field(None, alias='unionWard')
    village: Optional[str] = None
    detailed_address: Optional[str] = Field(None, alias='detailedAddress')
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    elevation: Optional[float] = None
    
    # Farm Size & Characteristics  
    total_area: Optional[float] = Field(None, alias='totalArea')
    cultivable_area: Optional[float] = Field(None, alias='cultivableArea')
    soil_type: Optional[SoilTypeEnum] = Field(None, alias='soilType')
    irrigation_source: Optional[IrrigationSourceEnum] = Field(None, alias='irrigationSource')
    water_source_distance: Optional[float] = Field(None, alias='waterSourceDistance')
    
    # Infrastructure
    has_electricity: Optional[bool] = Field(None, alias='hasElectricity')
    has_storage: Optional[bool] = Field(None, alias='hasStorage') 
    has_processing_unit: Optional[bool] = Field(None, alias='hasProcessingUnit')
    transportation_access: Optional[TransportationAccessEnum] = Field(None, alias='transportationAccess')
    
    # Experience & Production
    farming_experience: Optional[FarmingExperienceEnum] = Field(None, alias='farmingExperience')
    successful_crops: Optional[int] = Field(None, alias='successfulCrops')
    monthly_income: Optional[float] = Field(None, alias='monthlyIncome')
    yearly_production: Optional[float] = Field(None, alias='yearlyProduction')
    
    # Current Activity
    current_crops: Optional[str] = Field(None, alias='currentCrops')
    todays_work: Optional[int] = Field(None, alias='todaysWork')

    class Config:
        from_attributes = True
        populate_by_name = True

class FarmDataResponse(BaseModel):
    id: int
    farmer_name: str
    farm_name: Optional[str] = None
    description: Optional[str] = None
    farm_type: Optional[str] = None
    
    # Location
    division: Optional[str] = None
    district: Optional[str] = None
    upazila: Optional[str] = None
    union_ward: Optional[str] = None
    village: Optional[str] = None
    detailed_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    elevation: Optional[float] = None
    
    # Farm Details
    total_area: Optional[float] = None
    cultivable_area: Optional[float] = None
    soil_type: Optional[str] = None
    irrigation_source: Optional[str] = None
    water_source_distance: Optional[float] = None
    
    # Infrastructure
    has_electricity: Optional[bool] = None
    has_storage: Optional[bool] = None
    has_processing_unit: Optional[bool] = None
    transportation_access: Optional[str] = None
    
    # Experience & Production
    farming_experience: Optional[str] = None
    successful_crops: Optional[int] = None
    monthly_income: Optional[float] = None
    yearly_production: Optional[float] = None
    
    # Current Activity
    current_crops: Optional[str] = None
    todays_work: Optional[int] = None
    
    # Metadata
    owner_id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

# Legacy schema for backward compatibility
class FormDataSchema(BaseModel):
    farmer_name: str = Field(..., alias='farmerName')
    location: str
    crop_type: str = Field(..., alias='cropType')
    farming_experience: Optional[str] = Field(None, alias='farmingExperience')
    total_amount: str = Field(..., alias='totalAmount')
    successful_result: int = Field(..., alias='successfulResult')
    todays_work: Optional[int] = Field(None, alias='todaysWork')
    monthly_income: Optional[float] = Field(None, alias='monthlyIncome')

    class Config:
        from_attributes = True
        populate_by_name = True