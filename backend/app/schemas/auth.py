from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime

class UserRegistration(BaseModel):
    email: EmailStr
    phone: str
    full_name: str
    password: str
    confirm_password: str
    
    # Location (optional during registration)
    division: Optional[str] = None
    district: Optional[str] = None
    upazila: Optional[str] = None
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        # Basic Bangladesh phone number validation
        if not v.startswith(('01', '+8801')):
            raise ValueError('Invalid Bangladesh phone number')
        return v

class UserLogin(BaseModel):
    email_or_phone: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

class PhoneVerification(BaseModel):
    phone: str
    verification_code: str

class ResendVerification(BaseModel):
    phone: str