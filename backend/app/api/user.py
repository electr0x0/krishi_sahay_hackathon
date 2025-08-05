from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
from app.auth.dependencies import get_current_active_user

router = APIRouter()

@router.get("/users/me", response_model=schemas.UserProfile)
def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    """
    Get current user's profile.
    """
    return current_user

@router.put("/users/me", response_model=schemas.UserProfile)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Update own user profile.
    """
    user_data = user_update.model_dump(exclude_unset=True)
    
    for key, value in user_data.items():
        setattr(current_user, key, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user
