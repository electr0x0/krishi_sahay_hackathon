from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel, EmailStr
from typing import Dict, Any

from app.database import get_db
from app.models.admin import AdminUser
from app.auth.security import verify_password, create_access_token
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.get("/test")
async def test_admin_auth():
    """Test endpoint to verify admin auth routes are working"""
    return {"message": "Admin auth endpoints are working", "status": "ok"}

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

@router.post("/login")
async def admin_login(
    login_data: AdminLoginRequest,
    db: Session = Depends(get_db)
):
    """Admin login endpoint - accepts JSON with email and password"""
    
    # Find admin user by email
    admin = db.query(AdminUser).filter(AdminUser.email == login_data.email).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password (using SHA256 hash stored in database)
    import hashlib
    password_hash = hashlib.sha256(login_data.password.encode()).hexdigest()
    
    if admin.password_hash != password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive"
        )
    
    # Update last login
    from datetime import datetime
    try:
        admin.last_login = datetime.now()
        db.commit()
    except Exception as e:
        # If update fails, continue without it
        print(f"Warning: Could not update last login: {e}")
        db.rollback()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(admin.id),
            "email": admin.email,
            "role": admin.role,
            "is_admin": True
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": admin.id,
            "email": admin.email,
            "role": admin.role,
            "is_active": admin.is_active
        }
    }
