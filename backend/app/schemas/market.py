from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MarketPriceCreate(BaseModel):
    product_name_bn: str
    product_name_en: str
    category: str
    unit: str = "kg"
    market_name: str
    district: str
    division: str
    market_type: str
    current_price: float
    price_date: datetime

class MarketPrice(BaseModel):
    id: int
    product_name_bn: str
    product_name_en: str
    category: str
    unit: str
    market_name: str
    district: str
    division: str
    market_type: str
    current_price: float
    previous_price: Optional[float] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    avg_price: Optional[float] = None
    price_change: Optional[float] = None
    price_change_percentage: Optional[float] = None
    trend: Optional[str] = None
    supply_level: Optional[str] = None
    demand_level: Optional[str] = None
    quality_grade: Optional[str] = None
    data_source: str
    reliability_score: float
    price_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class MarketAlertCreate(BaseModel):
    product_name: str
    alert_type: str
    threshold_value: Optional[float] = None
    threshold_percentage: Optional[float] = None
    target_districts: Optional[List[str]] = None
    radius_km: Optional[float] = None

class MarketAlert(BaseModel):
    id: int
    user_id: int
    product_name: str
    alert_type: str
    threshold_value: Optional[float] = None
    threshold_percentage: Optional[float] = None
    title_bn: Optional[str] = None
    title_en: Optional[str] = None
    message_bn: Optional[str] = None
    message_en: Optional[str] = None
    severity: str
    is_active: bool
    last_triggered: Optional[datetime] = None
    trigger_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True