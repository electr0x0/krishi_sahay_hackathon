from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship 
from app.database import Base

class FarmData(Base):
    __tablename__ = "farm_data"

    id = Column(Integer, primary_key=True, index=True)
    farmer_name = Column(String, index=True)
    location = Column(String, nullable=True)
    crop_type = Column(String, nullable=True)
    farming_experience = Column(String, nullable=True)
    total_amount = Column(String)
    
   
    successful_result = Column(Integer)
    todays_work = Column(Integer)
    monthly_income = Column(Float)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="farm_data")