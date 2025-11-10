from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.admin import AdminRole
from app.models.user import User


router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Dependency to require admin role"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Check if user is admin by email
    if current_user.email != "admin@krishisahay.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user


def require_moderator(current_user: User = Depends(get_current_user)):
    """Dependency to require moderator or admin role"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Moderator access required"
        )
    
    # TODO: Implement proper role checking
    return current_user


def require_super_admin(current_user: User = Depends(get_current_user)):
    """Dependency to require super admin role"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    
    # TODO: Implement proper role checking
    return current_user
