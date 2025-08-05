from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class MarketPrice(Base):
    __tablename__ = "market_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Product Information
    product_name_bn = Column(String, nullable=False)
    product_name_en = Column(String, nullable=False)
    category = Column(String)  # vegetable, fruit, grain, spice
    unit = Column(String, default="kg")  # kg, ton, piece, dozen
    
    # Location Information
    market_name = Column(String)
    district = Column(String)
    division = Column(String)
    market_type = Column(String)  # wholesale, retail, export
    
    # Price Data
    current_price = Column(Float, nullable=False)  # BDT per unit
    previous_price = Column(Float)  # Previous day/week price
    min_price = Column(Float)  # Minimum price in period
    max_price = Column(Float)  # Maximum price in period
    avg_price = Column(Float)  # Average price in period
    
    # Price Trends
    price_change = Column(Float)  # Change from previous period
    price_change_percentage = Column(Float)  # Percentage change
    trend = Column(String)  # increasing, decreasing, stable
    
    # Market Conditions
    supply_level = Column(String)  # high, medium, low
    demand_level = Column(String)  # high, medium, low
    quality_grade = Column(String)  # A, B, C
    
    # Data Source
    data_source = Column(String)  # chaldal, government, manual, api
    reliability_score = Column(Float, default=1.0)  # 0-1
    
    # Timestamps
    price_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class MarketAlert(Base):
    __tablename__ = "market_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Alert Configuration
    product_name = Column(String, nullable=False)
    alert_type = Column(String, nullable=False)  # price_increase, price_decrease, good_demand
    threshold_value = Column(Float)  # Price threshold
    threshold_percentage = Column(Float)  # Percentage threshold
    
    # Geographic Scope
    target_districts = Column(Text)  # JSON array of districts
    target_markets = Column(Text)  # JSON array of markets
    radius_km = Column(Float)  # Alert radius from user location
    
    # Alert Content
    title_bn = Column(String)
    title_en = Column(String)
    message_bn = Column(Text)
    message_en = Column(Text)
    severity = Column(String, default="medium")  # low, medium, high, urgent
    
    # Delivery
    is_active = Column(Boolean, default=True)
    delivery_methods = Column(Text)  # JSON array: sms, email, push, voice
    last_triggered = Column(DateTime(timezone=True))
    trigger_count = Column(Integer, default=0)
    
    # Conditions
    max_triggers_per_day = Column(Integer, default=3)
    cooldown_hours = Column(Integer, default=2)  # Hours between alerts
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")