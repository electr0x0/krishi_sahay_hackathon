from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
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

class FarmCreate(BaseModel):
    name: str
    description: Optional[str] = None
    farm_type: FarmTypeEnum
    total_area: float
    cultivable_area: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    division: str
    district: str
    upazila: str
    union_ward: Optional[str] = None
    village: Optional[str] = None
    detailed_address: Optional[str] = None
    soil_type: Optional[SoilTypeEnum] = None
    irrigation_source: Optional[IrrigationSourceEnum] = None

class FarmUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    farm_type: Optional[FarmTypeEnum] = None
    total_area: Optional[float] = None
    cultivable_area: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    division: Optional[str] = None
    district: Optional[str] = None
    upazila: Optional[str] = None
    union_ward: Optional[str] = None
    village: Optional[str] = None
    detailed_address: Optional[str] = None
    soil_type: Optional[SoilTypeEnum] = None
    irrigation_source: Optional[IrrigationSourceEnum] = None

class Farm(BaseModel):
    id: int
    owner_id: int
    name: str
    description: Optional[str] = None
    farm_type: str
    total_area: float
    cultivable_area: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    division: str
    district: str
    upazila: str
    union_ward: Optional[str] = None
    village: Optional[str] = None
    detailed_address: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_source: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CropCreate(BaseModel):
    farm_id: int
    name_bn: str
    name_en: str
    variety: Optional[str] = None
    category: str
    planting_date: datetime
    expected_harvest_date: datetime
    cultivated_area: float
    expected_yield: Optional[float] = None

class CropUpdate(BaseModel):
    name_bn: Optional[str] = None
    name_en: Optional[str] = None
    variety: Optional[str] = None
    category: Optional[str] = None
    planting_date: Optional[datetime] = None
    expected_harvest_date: Optional[datetime] = None
    actual_harvest_date: Optional[datetime] = None
    cultivated_area: Optional[float] = None
    expected_yield: Optional[float] = None
    actual_yield: Optional[float] = None
    current_stage: Optional[str] = None
    growth_percentage: Optional[float] = None
    health_status: Optional[str] = None

class Crop(BaseModel):
    id: int
    farm_id: int
    name_bn: str
    name_en: str
    variety: Optional[str] = None
    category: str
    planting_date: datetime
    expected_harvest_date: datetime
    actual_harvest_date: Optional[datetime] = None
    cultivated_area: float
    expected_yield: Optional[float] = None
    actual_yield: Optional[float] = None
    current_stage: str
    growth_percentage: float
    health_status: str
    investment_cost: Optional[float] = None
    expected_revenue: Optional[float] = None
    actual_revenue: Optional[float] = None
    is_active: bool
    is_harvested: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True