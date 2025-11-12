"""
Language and Dialect preferences API
Manage user language and dialect preferences
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.services.dialect_service import dialect_service
from app.core.language_config import language_config


router = APIRouter()


class LanguagePreferenceCreate(BaseModel):
    primary_language: str = "bn"
    primary_dialect: Optional[str] = None
    secondary_languages: Optional[List[str]] = None
    auto_detect: bool = True
    auto_translate: bool = False
    tts_enabled: bool = False
    tts_dialect: Optional[str] = None
    stt_enabled: bool = False
    stt_dialect: Optional[str] = None


class LanguagePreferenceUpdate(BaseModel):
    primary_language: Optional[str] = None
    primary_dialect: Optional[str] = None
    secondary_languages: Optional[List[str]] = None
    auto_detect: Optional[bool] = None
    auto_translate: Optional[bool] = None
    tts_enabled: Optional[bool] = None
    tts_dialect: Optional[str] = None
    stt_enabled: Optional[bool] = None
    stt_dialect: Optional[str] = None


class DialectInfo(BaseModel):
    code: str
    name: str
    native_name: str
    base_language: str
    region: Optional[str] = None
    tts_supported: bool
    stt_supported: bool
    writing_system: str


@router.get("/supported-languages", response_model=List[DialectInfo])
async def get_supported_languages():
    """Get list of all supported languages and dialects"""
    
    supported = dialect_service.get_supported_dialects()
    return supported


@router.get("/detect")
async def detect_language_dialect(
    text: str,
    current_user: User = Depends(get_current_user)
):
    """Detect language and dialect of given text"""
    
    user_context = {
        "region": current_user.region if hasattr(current_user, 'region') else None,
        "preferred_dialect": current_user.preferred_dialect if hasattr(current_user, 'preferred_dialect') else None
    }
    
    result = dialect_service.auto_detect_and_normalize(
        text=text,
        user_context=user_context
    )
    
    return result


@router.post("/translate")
async def translate_with_dialect(
    text: str,
    target_dialect: str,
    source_dialect: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Translate text between dialects"""
    
    from app.services.translation_service import translation_service
    
    user_context = {
        "region": current_user.region if hasattr(current_user, 'region') else None,
        "preferred_dialect": current_user.preferred_dialect if hasattr(current_user, 'preferred_dialect') else None
    }
    
    result = await translation_service.translate_with_dialect_support(
        text=text,
        target_language=target_dialect,
        source_dialect=source_dialect,
        user_context=user_context
    )
    
    return result


@router.get("/my-preferences")
async def get_my_language_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's language preferences"""
    
    # Try to get from user_language_preferences table
    result = db.execute(
        """
        SELECT * FROM user_language_preferences 
        WHERE user_id = ?
        """,
        (current_user.id,)
    ).fetchone()
    
    if result:
        return {
            "user_id": current_user.id,
            "primary_language": result[2] if len(result) > 2 else "bn",
            "primary_dialect": result[3] if len(result) > 3 else None,
            "auto_detect": bool(result[5]) if len(result) > 5 else True,
            "auto_translate": bool(result[6]) if len(result) > 6 else False,
            "tts_enabled": bool(result[8]) if len(result) > 8 else False,
            "tts_dialect": result[9] if len(result) > 9 else None,
            "stt_enabled": bool(result[10]) if len(result) > 10 else False,
            "stt_dialect": result[11] if len(result) > 11 else None,
        }
    else:
        # Fallback to user table
        return {
            "user_id": current_user.id,
            "primary_language": current_user.preferred_language or "bn",
            "primary_dialect": current_user.preferred_dialect if hasattr(current_user, 'preferred_dialect') else None,
            "auto_detect": True,
            "auto_translate": False,
            "tts_enabled": False,
            "stt_enabled": False,
        }


@router.put("/my-preferences")
async def update_my_language_preferences(
    preferences: LanguagePreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's language preferences"""
    
    # Check if preferences exist
    existing = db.execute(
        "SELECT id FROM user_language_preferences WHERE user_id = ?",
        (current_user.id,)
    ).fetchone()
    
    if existing:
        # Update existing preferences
        update_fields = []
        update_values = []
        
        for field, value in preferences.model_dump(exclude_unset=True).items():
            if value is not None:
                update_fields.append(f"{field} = ?")
                update_values.append(value)
        
        if update_fields:
            update_values.append(current_user.id)
            query = f"""
                UPDATE user_language_preferences 
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """
            db.execute(query, tuple(update_values))
            db.commit()
    else:
        # Create new preferences
        db.execute("""
            INSERT INTO user_language_preferences 
            (user_id, primary_language, primary_dialect, auto_detect, auto_translate,
             tts_enabled, tts_dialect, stt_enabled, stt_dialect)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            current_user.id,
            preferences.primary_language or "bn",
            preferences.primary_dialect,
            preferences.auto_detect if preferences.auto_detect is not None else True,
            preferences.auto_translate if preferences.auto_translate is not None else False,
            preferences.tts_enabled if preferences.tts_enabled is not None else False,
            preferences.tts_dialect,
            preferences.stt_enabled if preferences.stt_enabled is not None else False,
            preferences.stt_dialect,
        ))
        db.commit()
    
    # Also update user table for quick access
    if hasattr(current_user, 'preferred_dialect') and preferences.primary_dialect:
        current_user.preferred_dialect = preferences.primary_dialect
    if preferences.primary_language:
        current_user.preferred_language = preferences.primary_language
    
    db.commit()
    
    return {"message": "Language preferences updated successfully"}


@router.get("/dialect-info/{dialect_code}")
async def get_dialect_info(dialect_code: str):
    """Get detailed information about a specific dialect"""
    
    info = dialect_service.get_dialect_info(dialect_code)
    
    if not info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dialect '{dialect_code}' not found"
        )
    
    return info


@router.get("/region-dialect/{region}")
async def get_region_dialect(region: str):
    """Get the primary dialect for a region"""
    
    dialect = language_config.get_dialect_by_region(region.lower())
    dialect_info = dialect_service.get_dialect_info(dialect)
    
    return {
        "region": region,
        "dialect_code": dialect,
        "dialect_info": dialect_info
    }
