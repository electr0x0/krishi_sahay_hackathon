from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

# 👇 CORRECTED IMPORTS
from app.models.form_data import FarmData  # Import FarmData class directly
from app.models.user import User          # Import User class directly
from app.schemas.form_data import FormDataSchema
from app.database import get_db
from app.auth.dependencies import get_current_active_user

router = APIRouter()

# --- Endpoint to CREATE new data ---
@router.post("/", response_model=FormDataSchema)
def create_or_update_farm_data(  # Renamed for clarity
    *,
    db: Session = Depends(get_db),
    form_data: FormDataSchema,
    current_user: User = Depends(get_current_active_user)
):
    
    db_obj = db.query(FarmData).filter(FarmData.owner_id == current_user.id).first()

    if db_obj:
       
        update_data = form_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_obj, key, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    else:
        
        db_obj = FarmData(**form_data.model_dump(), owner_id=current_user.id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

# --- Endpoint to GET all data ---
@router.get("/", response_model=List[FormDataSchema])
def get_user_farm_data(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return current_user.farm_data