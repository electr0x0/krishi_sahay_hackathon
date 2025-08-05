from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import uuid

from app.database import get_db
from app.models.user import User, UserPreferences
from app.schemas.auth import (
    UserRegistration, UserLogin, Token, PasswordReset, 
    PasswordResetConfirm, PhoneVerification
)
from app.schemas.user import UserProfile, UserPreferences as UserPreferencesSchema
from app.auth.security import (
    verify_password, get_password_hash, create_access_token, 
    create_refresh_token
)
from app.auth.dependencies import get_current_user
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.post("/register", response_model=Token)
async def register_user(user_data: UserRegistration, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.phone == user_data.phone)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or phone already exists"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        phone=user_data.phone,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        division=user_data.division,
        district=user_data.district,
        upazila=user_data.upazila,
        verification_token=str(uuid.uuid4())
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create default preferences
    preferences = UserPreferences(
        user_id=new_user.id,
        preferred_language="bn",
        voice_enabled=True,
        sms_notifications=True,
        email_notifications=True,
        push_notifications=True,
        weather_alerts=True,
        market_alerts=True,
        crop_alerts=True,
        pest_alerts=True,
        ai_assistance_level="medium",
        auto_suggestions=True,
        data_sharing=True
    )
    
    db.add(preferences)
    db.commit()
    
    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(new_user.id), "email": new_user.email},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user with email/phone and password"""
    
    # Find user by email or phone
    user = db.query(User).filter(
        (User.email == form_data.username) | (User.phone == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/phone or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Update last login
    from datetime import datetime
    user.last_login = datetime.now()
    db.commit()
    
    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.get("/me/preferences", response_model=UserPreferencesSchema)
async def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user preferences"""
    preferences = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()
    
    if not preferences:
        # Create default preferences if not exist
        preferences = UserPreferences(
            user_id=current_user.id,
            preferred_language="bn"
        )
        db.add(preferences)
        db.commit()
        db.refresh(preferences)
    
    return preferences

@router.post("/logout")
async def logout_user(current_user: User = Depends(get_current_user)):
    """Logout user (client should discard tokens)"""
    return {"message": "Successfully logged out"}

@router.post("/verify-phone")
async def verify_phone(
    verification_data: PhoneVerification,
    db: Session = Depends(get_db)
):
    """Verify phone number with SMS code"""
    # In production, integrate with SMS service
    # For now, accept any 6-digit code
    if len(verification_data.verification_code) == 6:
        return {"message": "Phone verified successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )

@router.post("/forgot-password")
async def forgot_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
):
    """Send password reset email"""
    user = db.query(User).filter(User.email == reset_data.email).first()
    
    if user:
        # In production, send actual email
        # For now, just return success
        reset_token = str(uuid.uuid4())
        user.verification_token = reset_token
        db.commit()
        
        return {"message": "Password reset email sent"}
    else:
        # Don't reveal if email exists
        return {"message": "Password reset email sent"}

@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """Reset password with token"""
    user = db.query(User).filter(
        User.verification_token == reset_data.token
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password
    user.hashed_password = get_password_hash(reset_data.new_password)
    user.verification_token = None
    db.commit()
    
    return {"message": "Password reset successfully"}