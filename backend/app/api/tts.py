"""
Text-to-Speech API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional
import io
import logging

from app.services.tts_service import tts_service
from app.auth.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tts", tags=["text-to-speech"])

class TTSRequest(BaseModel):
    """TTS request model"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to convert to speech")
    language: Optional[str] = Field(None, description="Language code (auto-detected if not provided)")
    slow: bool = Field(False, description="Whether to speak slowly")

class TTSResponse(BaseModel):
    """TTS response model for metadata"""
    message: str
    language_used: str
    text_length: int
    audio_size: int

@router.post("/synthesize")
async def synthesize_speech(
    request: TTSRequest,
    current_user = Depends(get_current_user)
) -> StreamingResponse:
    """
    Convert text to speech and return audio stream
    
    Args:
        request: TTS request containing text and options
        current_user: Current authenticated user
        
    Returns:
        StreamingResponse with audio/mpeg content
        
    Raises:
        HTTPException: If TTS generation fails
    """
    try:
        logger.info(f"TTS request from user {current_user.id}: '{request.text[:50]}...'")
        
        # Generate speech audio
        audio_data = await tts_service.generate_speech(
            text=request.text,
            language=request.language,
            slow=request.slow
        )
        
        # Create streaming response
        audio_stream = io.BytesIO(audio_data)
        
        # Determine content type
        content_type = "audio/mpeg"
        
        logger.info(f"Returning audio stream, size: {len(audio_data)} bytes")
        
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type=content_type,
            headers={
                "Content-Length": str(len(audio_data)),
                "Content-Disposition": "inline; filename=speech.mp3",
                "Cache-Control": "no-cache",
            }
        )
        
    except ValueError as e:
        logger.error(f"TTS validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"TTS generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate speech audio")

@router.get("/languages")
async def get_supported_languages():
    """
    Get list of supported languages for TTS
    
    Returns:
        Dictionary of supported language codes and names
    """
    try:
        languages = tts_service.get_supported_languages()
        return {
            "supported_languages": languages,
            "total_count": len(languages),
            "recommended": {
                "bn": "Bengali",
                "en": "English", 
                "hi": "Hindi"
            }
        }
    except Exception as e:
        logger.error(f"Error fetching supported languages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch supported languages")

@router.post("/test")
async def test_tts(
    language: str = "bn",
    current_user = Depends(get_current_user)
) -> StreamingResponse:
    """
    Test TTS with sample text
    
    Args:
        language: Language code for test (default: Bengali)
        current_user: Current authenticated user
        
    Returns:
        StreamingResponse with test audio
    """
    try:
        # Sample texts for different languages
        test_texts = {
            "bn": "এটি একটি পরীক্ষামূলক বার্তা। কৃষি বিষয়ক সহায়তার জন্য আমি এখানে আছি।",
            "en": "This is a test message. I am here to help with agricultural assistance.",
            "hi": "यह एक परीक्षण संदेश है। मैं कृषि सहायता के लिए यहाँ हूँ।"
        }
        
        test_text = test_texts.get(language, test_texts["en"])
        
        # Generate speech audio
        audio_data = await tts_service.generate_speech(
            text=test_text,
            language=language,
            slow=False
        )
        
        logger.info(f"TTS test successful for language: {language}")
        
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/mpeg",
            headers={
                "Content-Length": str(len(audio_data)),
                "Content-Disposition": f"inline; filename=test_{language}.mp3",
                "Cache-Control": "no-cache",
            }
        )
        
    except Exception as e:
        logger.error(f"TTS test error: {str(e)}")
        raise HTTPException(status_code=500, detail="TTS test failed")

# Health check endpoint for TTS service
@router.get("/health")
async def tts_health_check():
    """
    Check TTS service health
    
    Returns:
        Health status and service information
    """
    try:
        # Test basic functionality
        supported_languages = tts_service.get_supported_languages()
        
        return {
            "status": "healthy",
            "service": "Google Text-to-Speech (gTTS)",
            "supported_languages_count": len(supported_languages),
            "key_languages": ["bn", "en", "hi"],
            "version": "2.5.1"
        }
    except Exception as e:
        logger.error(f"TTS health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }