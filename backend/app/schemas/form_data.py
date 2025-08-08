from pydantic import BaseModel, Field
from typing import Optional

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
        # This allows Pydantic to create the schema from your database object
        from_attributes = True 
        
        # This ensures the aliases are used for both incoming and outgoing data
        populate_by_name = True