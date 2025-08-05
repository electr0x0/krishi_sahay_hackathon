"""
Text-to-Speech Service using Google TTS (gTTS)
Provides high-quality Bengali and multilingual TTS capabilities
"""

import io
import logging
from typing import Optional
from gtts import gTTS
from gtts.lang import tts_langs
import re

logger = logging.getLogger(__name__)

class TTSService:
    """Text-to-Speech service using Google TTS"""
    
    def __init__(self):
        """Initialize TTS service"""
        self.supported_languages = tts_langs()
        logger.info(f"TTS Service initialized with {len(self.supported_languages)} supported languages")
    
    def detect_language(self, text: str) -> str:
        """
        Detect if text contains Bengali characters and return appropriate language code
        
        Args:
            text: Input text to analyze
            
        Returns:
            Language code ('bn' for Bengali, 'en' for English)
        """
        # Check for Bengali Unicode characters
        bengali_pattern = r'[\u0980-\u09FF]'
        
        if re.search(bengali_pattern, text):
            return 'bn'  # Bengali
        else:
            return 'en'  # English (default)
    
    def clean_text(self, text: str) -> str:
        """
        Clean and prepare text for TTS
        
        Args:
            text: Raw input text
            
        Returns:
            Cleaned text suitable for TTS
        """
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove markdown formatting
        text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # Bold
        text = re.sub(r'\*([^*]+)\*', r'\1', text)      # Italic
        text = re.sub(r'`([^`]+)`', r'\1', text)        # Code
        text = re.sub(r'#{1,6}\s*', '', text)           # Headers
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove excessive punctuation
        text = re.sub(r'[.]{3,}', '...', text)
        text = re.sub(r'[!]{2,}', '!', text)
        text = re.sub(r'[?]{2,}', '?', text)
        
        # Ensure text is not empty after cleaning
        if not text.strip():
            return "Text is empty or contains only formatting."
        
        return text.strip()
    
    async def generate_speech(
        self, 
        text: str, 
        language: Optional[str] = None,
        slow: bool = False
    ) -> bytes:
        """
        Generate speech audio from text using gTTS
        
        Args:
            text: Text to convert to speech
            language: Language code (auto-detected if None)
            slow: Whether to speak slowly
            
        Returns:
            Audio data as bytes
            
        Raises:
            ValueError: If text is empty or language not supported
            Exception: If TTS generation fails
        """
        try:
            # Clean the input text
            cleaned_text = self.clean_text(text)
            
            if not cleaned_text:
                raise ValueError("Text is empty after cleaning")
            
            # Detect language if not provided
            if language is None:
                language = self.detect_language(cleaned_text)
            
            # Validate language support
            if language not in self.supported_languages:
                logger.warning(f"Language {language} not supported, falling back to English")
                language = 'en'
            
            logger.info(f"Generating TTS for text: '{cleaned_text[:50]}...' in language: {language}")
            
            # Create gTTS object
            tts = gTTS(
                text=cleaned_text,
                lang=language,
                slow=slow
            )
            
            # Generate audio in memory
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            
            audio_data = audio_buffer.getvalue()
            
            logger.info(f"TTS generation successful, audio size: {len(audio_data)} bytes")
            return audio_data
            
        except Exception as e:
            logger.error(f"TTS generation failed: {str(e)}")
            raise Exception(f"Failed to generate speech: {str(e)}")
    
    def is_language_supported(self, language: str) -> bool:
        """
        Check if a language is supported by gTTS
        
        Args:
            language: Language code to check
            
        Returns:
            True if language is supported, False otherwise
        """
        return language in self.supported_languages
    
    def get_supported_languages(self) -> dict:
        """
        Get all supported languages
        
        Returns:
            Dictionary of language codes and names
        """
        return self.supported_languages

# Global TTS service instance
tts_service = TTSService()