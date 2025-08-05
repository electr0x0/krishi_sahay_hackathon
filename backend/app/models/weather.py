from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class WeatherCache(Base):
    __tablename__ = "weather_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, unique=True, index=True)
    current_data = Column(Text)  # JSON string
    forecast_data = Column(Text) # JSON string
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
