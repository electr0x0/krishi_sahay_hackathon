from typing import Optional, Dict, Any
import asyncio
from googletrans import Translator
from deep_translator import GoogleTranslator
import httpx

class TranslationService:
    def __init__(self):
        self.google_translator = Translator()
        self.deep_translator = GoogleTranslator()
        
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

# Global instance
translation_service = TranslationService()