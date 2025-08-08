from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.schemas.form_data import FormDataSchema
from app.models.form_data import FarmData
from app.database import get_db
from app.auth.dependencies import get_current_active_user
router = APIRouter()

@router.post("/", response_model=FormDataSchema)
def create_new_farm_data(
    *,
    db: Session = Depends(get_db),
    form_data: FormDataSchema
):
  
    try:
     
        db_obj = FarmData(**form_data.dict())
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        return db_obj
    except Exception as e:
        db.rollback() # Rollback the transaction in case of an error
        print(f"❌ Error saving data to the database: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while saving data.")