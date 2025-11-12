from typing import Optional, Dict, Any
import asyncio
from googletrans import Translator
from deep_translator import GoogleTranslator
import httpx

from app.core.language_config import language_config
from app.services.dialect_service import dialect_service


class TranslationService:
    def __init__(self):
        self.google_translator = Translator()
        self.deep_translator = GoogleTranslator()
        self.language_config = language_config
        self.dialect_service = dialect_service
        
    async def translate_text(
        self,
        text: str,
        target_language: str,
        source_language: str = "auto"
    ) -> Dict[str, Any]:
        """
        Translate text using Google Translate
        
        Args:
            text: Text to translate
            target_language: Target language code (bn, en)
            source_language: Source language code (auto for detection)
            
        Returns:
            Dict with translation result
        """
        try:
            # Use deep-translator for better async support
            translated = await asyncio.to_thread(
                self.deep_translator.translate,
                text=text,
                target=target_language,
                source=source_language if source_language != "auto" else "auto"
            )
            
            return {
                "translated_text": translated,
                "source_language": source_language,
                "target_language": target_language,
                "original_text": text,
                "success": True
            }
            
        except Exception as e:
            # Fallback to googletrans
            try:
                result = await asyncio.to_thread(
                    self.google_translator.translate,
                    text,
                    dest=target_language,
                    src=source_language
                )
                
                return {
                    "translated_text": result.text,
                    "source_language": result.src,
                    "target_language": target_language,
                    "original_text": text,
                    "confidence": getattr(result, 'confidence', None),
                    "success": True
                }
                
            except Exception as fallback_error:
                return {
                    "translated_text": text,  # Return original if translation fails
                    "error": str(fallback_error),
                    "success": False
                }
    
    async def detect_language(self, text: str) -> Dict[str, Any]:
        """
        Detect language of given text
        
        Args:
            text: Text to analyze
            
        Returns:
            Dict with detected language info
        """
        try:
            result = await asyncio.to_thread(
                self.google_translator.detect,
                text
            )
            
            return {
                "language": result.lang,
                "confidence": result.confidence,
                "success": True
            }
            
        except Exception as e:
            return {
                "language": "unknown",
                "error": str(e),
                "success": False
            }
    
    async def translate_to_preferred_language(
        self,
        text: str,
        user_language: str,
        source_language: str = "auto"
    ) -> str:
        """
        Translate text to user's preferred language
        
        Args:
            text: Text to translate
            user_language: User's preferred language (bn/en)
            source_language: Source language
            
        Returns:
            Translated text
        """
        if not text.strip():
            return text
            
        # Skip translation if source and target are the same
        if source_language == user_language:
            return text
            
        result = await self.translate_text(
            text=text,
            target_language=user_language,
            source_language=source_language
        )
        
        return result.get("translated_text", text)
    
    async def translate_agricultural_terms(
        self,
        text: str,
        target_language: str
    ) -> Dict[str, Any]:
        """
        Translate agricultural text with better context understanding
        
        Args:
            text: Agricultural text to translate
            target_language: Target language
            
        Returns:
            Enhanced translation result
        """
        # Agricultural term mappings for better translation
        agricultural_terms = {
            "bn_to_en": {
                "ধান": "rice",
                "গম": "wheat", 
                "ভুট্টা": "corn/maize",
                "পাট": "jute",
                "আলু": "potato",
                "টমেটো": "tomato",
                "বেগুন": "eggplant",
                "মরিচ": "chili",
                "পেঁয়াজ": "onion",
                "রসুন": "garlic",
                "কৃষক": "farmer",
                "খেত": "field",
                "ফসল": "crop",
                "সার": "fertilizer",
                "কীটনাশক": "pesticide",
                "সেচ": "irrigation",
                "বৃষ্টি": "rain",
                "খরা": "drought",
                "বন্যা": "flood"
            },
            "en_to_bn": {
                "rice": "ধান",
                "wheat": "গম",
                "corn": "ভুট্টা",
                "maize": "ভুট্টা",
                "jute": "পাট",
                "potato": "আলু",
                "tomato": "টমেটো",
                "eggplant": "বেগুন",
                "chili": "মরিচ",
                "onion": "পেঁয়াজ",
                "garlic": "রসুন",
                "farmer": "কৃষক",
                "field": "খেত",
                "crop": "ফসল",
                "fertilizer": "সার",
                "pesticide": "কীটনাশক",
                "irrigation": "সেচ",
                "rain": "বৃষ্টি",
                "drought": "খরা",
                "flood": "বন্যা"
            }
        }
        
        # Pre-process text with agricultural term mappings
        processed_text = text
        term_mapping = agricultural_terms.get(f"bn_to_{target_language}", {})
        if target_language == "bn":
            term_mapping = agricultural_terms.get("en_to_bn", {})
            
        for term, translation in term_mapping.items():
            processed_text = processed_text.replace(term, translation)
        
        # Regular translation
        result = await self.translate_text(
            text=processed_text,
            target_language=target_language
        )
        
        return result

    async def translate_with_dialect_support(
        self,
        text: str,
        target_language: str,
        source_dialect: Optional[str] = None,
        target_dialect: Optional[str] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Translate text with full dialect support
        
        Args:
            text: Text to translate
            target_language: Target base language (bn, en)
            source_dialect: Source dialect code (optional)
            target_dialect: Target dialect code (optional)
            user_context: User context for better dialect detection
            
        Returns:
            Translation result with dialect information
        """
        try:
            # Step 1: Detect source dialect if not provided
            if not source_dialect:
                detection = self.dialect_service.detect_dialect(
                    text=text,
                    user_region=user_context.get("region") if user_context else None,
                    user_preferred_dialect=user_context.get("preferred_dialect") if user_context else None
                )
                source_dialect = detection["dialect"]
                detection_confidence = detection["confidence"]
            else:
                detection_confidence = 1.0
            
            # Step 2: Normalize source dialect to standard language
            normalized = self.dialect_service.normalize_to_standard(
                text=text,
                source_dialect=source_dialect,
                preserve_original=True
            )
            
            # Step 3: Translate to target base language
            source_base = self.language_config.get_base_language(source_dialect)
            target_base = self.language_config.get_base_language(target_dialect or target_language)
            
            if source_base != target_base:
                translation = await self.translate_text(
                    text=normalized["normalized_text"],
                    target_language=target_base,
                    source_language=source_base
                )
                translated_text = translation.get("translated_text", normalized["normalized_text"])
            else:
                translated_text = normalized["normalized_text"]
            
            # Step 4: Convert to target dialect if specified
            if target_dialect and target_dialect not in [target_language, target_base]:
                conversion = self.dialect_service.convert_response_to_dialect(
                    text=translated_text,
                    target_dialect=target_dialect
                )
                final_text = conversion["converted_text"]
            else:
                final_text = translated_text
            
            # Step 5: Apply agricultural term translation
            if target_dialect or target_language:
                final_text = self.dialect_service.translate_agricultural_terms(
                    text=final_text,
                    from_dialect=source_base,
                    to_dialect=target_dialect or target_language
                )
            
            return {
                "original_text": text,
                "translated_text": final_text,
                "source_dialect": source_dialect,
                "target_dialect": target_dialect or target_language,
                "detection_confidence": detection_confidence,
                "normalization_applied": normalized["changes_made"],
                "success": True
            }
            
        except Exception as e:
            return {
                "original_text": text,
                "translated_text": text,
                "error": str(e),
                "success": False
            }

    async def auto_translate_for_user(
        self,
        text: str,
        user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Automatically translate text based on user's language and dialect preferences
        
        Args:
            text: Text to translate
            user_context: User preferences including dialect, language, region
            
        Returns:
            Translation result
        """
        user_language = user_context.get("language", "bn")
        user_dialect = user_context.get("dialect", user_language)
        
        return await self.translate_with_dialect_support(
            text=text,
            target_language=user_language,
            target_dialect=user_dialect,
            user_context=user_context
        )
    
    async def detect_language_and_dialect(
        self,
        text: str,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Detect both language and dialect of text
        
        Args:
            text: Text to analyze
            user_context: User context for better detection
            
        Returns:
            Detection result with language and dialect info
        """
        # Use dialect service for comprehensive detection
        detection = self.dialect_service.auto_detect_and_normalize(
            text=text,
            user_context=user_context or {}
        )
        
        # Also get base language detection from Google
        try:
            google_detection = await self.detect_language(text)
            detection["google_language"] = google_detection.get("language")
            detection["google_confidence"] = google_detection.get("confidence")
        except:
            pass
        
        return detection


# Global instance
translation_service = TranslationService()