"""
Dialect detection and normalization service
Handles regional Bangla variations and language detection
"""

from typing import Dict, List, Optional, Tuple, Any
import re
from collections import Counter

from app.core.language_config import language_config, LanguageCode


class DialectDetectionService:
    """Service for detecting and normalizing regional dialects"""
    
    def __init__(self):
        self.config = language_config
        self.detection_cache: Dict[str, str] = {}
    
    def detect_dialect(
        self,
        text: str,
        user_region: Optional[str] = None,
        user_preferred_dialect: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Detect the dialect of input text
        
        Args:
            text: Input text to analyze
            user_region: User's region (helps with detection)
            user_preferred_dialect: User's stated dialect preference
            
        Returns:
            Detection result with dialect code and confidence
        """
        # Quick return for cached results
        cache_key = f"{text[:50]}_{user_region}"
        if cache_key in self.detection_cache:
            return {
                "dialect": self.detection_cache[cache_key],
                "confidence": 0.95,
                "source": "cache"
            }
        
        # If user has a preferred dialect, use it with high confidence
        if user_preferred_dialect and self.config.is_dialect_supported(user_preferred_dialect):
            return {
                "dialect": user_preferred_dialect,
                "confidence": 0.9,
                "source": "user_preference",
                "base_language": self.config.get_base_language(user_preferred_dialect)
            }
        
        # Check if text is in English (Latin script)
        if self._is_latin_script(text):
            return {
                "dialect": "en",
                "confidence": 0.95,
                "source": "script_detection",
                "base_language": "en"
            }
        
        # Pattern-based detection for Bengali dialects
        dialect_scores = self._score_dialects(text)
        
        # Consider user region in scoring
        if user_region:
            regional_dialect = self.config.get_dialect_by_region(user_region)
            if regional_dialect in dialect_scores:
                # Boost regional dialect score
                dialect_scores[regional_dialect] += 2
        
        # Get the highest scoring dialect
        if dialect_scores:
            detected_dialect = max(dialect_scores, key=dialect_scores.get)
            confidence = min(0.95, dialect_scores[detected_dialect] / 10)
            
            # Cache the result
            self.detection_cache[cache_key] = detected_dialect
            
            return {
                "dialect": detected_dialect,
                "confidence": confidence,
                "source": "pattern_matching",
                "base_language": self.config.get_base_language(detected_dialect),
                "scores": dialect_scores
            }
        
        # Default to standard Bengali
        return {
            "dialect": "bn",
            "confidence": 0.5,
            "source": "default",
            "base_language": "bn"
        }
    
    def _is_latin_script(self, text: str) -> bool:
        """Check if text is primarily in Latin script (English)"""
        # Count Latin characters vs Bengali characters
        latin_chars = sum(1 for c in text if ord(c) < 0x0980 or ord(c) > 0x09FF)
        bengali_chars = sum(1 for c in text if 0x0980 <= ord(c) <= 0x09FF)
        
        total_alpha = latin_chars + bengali_chars
        if total_alpha == 0:
            return False
        
        return latin_chars / total_alpha > 0.7
    
    def _score_dialects(self, text: str) -> Dict[str, int]:
        """
        Score different dialects based on pattern matching
        
        Returns:
            Dictionary of dialect codes and their scores
        """
        text_lower = text.lower()
        scores = Counter()
        
        # Score based on detection patterns
        for dialect, patterns in self.config.DETECTION_PATTERNS.items():
            for pattern in patterns:
                # Count occurrences of dialect-specific words
                count = text_lower.count(pattern.lower())
                if count > 0:
                    scores[dialect] += count
        
        return dict(scores)
    
    def normalize_to_standard(
        self,
        text: str,
        source_dialect: str,
        preserve_original: bool = False
    ) -> Dict[str, Any]:
        """
        Normalize dialect text to standard Bengali for AI processing
        Uses word-level and phrase-level matching for better accuracy
        
        Args:
            text: Input text in dialect
            source_dialect: Source dialect code
            preserve_original: Whether to include original text
            
        Returns:
            Normalized text and metadata
        """
        # If already standard Bengali or English, return as is
        if source_dialect in ["bn", "en", "hi", "ur"]:
            return {
                "normalized_text": text,
                "original_text": text if preserve_original else None,
                "source_dialect": source_dialect,
                "target_dialect": source_dialect,
                "changes_made": False
            }
        
        # Get vocabulary for this dialect
        vocabulary = self.config.DIALECT_VOCABULARY.get(source_dialect, {})
        if not vocabulary:
            return {
                "normalized_text": text,
                "original_text": text if preserve_original else None,
                "source_dialect": source_dialect,
                "target_dialect": "bn",
                "changes_made": False
            }
        
        # Normalize using word boundaries for better accuracy
        normalized = text
        
        # Sort by length (longest first) to handle compound words
        sorted_words = sorted(vocabulary.items(), key=lambda x: len(x[0]), reverse=True)
        
        for dialect_word, standard_word in sorted_words:
            # Replace whole words (with word boundaries)
            import re
            # Create pattern that matches word boundaries
            pattern = r'\b' + re.escape(dialect_word) + r'\b'
            normalized = re.sub(pattern, standard_word, normalized, flags=re.IGNORECASE)
        
        return {
            "normalized_text": normalized,
            "original_text": text if preserve_original else None,
            "source_dialect": source_dialect,
            "target_dialect": "bn",
            "changes_made": normalized != text
        }
    
    def convert_response_to_dialect(
        self,
        text: str,
        target_dialect: str,
        preserve_formality: bool = True
    ) -> Dict[str, Any]:
        """
        Convert standard Bengali response to target dialect
        Uses word-level replacement for natural dialect conversion
        
        Args:
            text: Standard Bengali text
            target_dialect: Target dialect code
            preserve_formality: Keep formal tone if true
            
        Returns:
            Converted text and metadata
        """
        # If target is standard Bengali or English, return as is
        if target_dialect in ["bn", "en"]:
            return {
                "converted_text": text,
                "original_text": text,
                "source_dialect": "bn",
                "target_dialect": target_dialect,
                "changes_made": False
            }
        
        # Get vocabulary for target dialect
        vocabulary = self.config.DIALECT_VOCABULARY.get(target_dialect, {})
        if not vocabulary:
            return {
                "converted_text": text,
                "original_text": text,
                "source_dialect": "bn",
                "target_dialect": target_dialect,
                "changes_made": False
            }
        
        # Convert to dialect (reverse mapping - standard to dialect)
        converted = text
        
        # Create reverse mapping
        reverse_vocab = {v: k for k, v in vocabulary.items()}
        
        # Sort by length (longest first) for better matching
        sorted_words = sorted(reverse_vocab.items(), key=lambda x: len(x[0]), reverse=True)
        
        import re
        for standard_word, dialect_word in sorted_words:
            # Replace whole words with word boundaries
            pattern = r'\b' + re.escape(standard_word) + r'\b'
            converted = re.sub(pattern, dialect_word, converted, flags=re.IGNORECASE)
        
        return {
            "converted_text": converted,
            "original_text": text,
            "source_dialect": "bn",
            "target_dialect": target_dialect,
            "changes_made": converted != text
        }
    
    def translate_agricultural_terms(
        self,
        text: str,
        from_dialect: str,
        to_dialect: str
    ) -> str:
        """
        Translate agricultural terms between dialects with improved matching
        
        Args:
            text: Text containing agricultural terms
            from_dialect: Source dialect
            to_dialect: Target dialect
            
        Returns:
            Translated text
        """
        if from_dialect == to_dialect:
            return text
        
        translated = text
        
        # Get agricultural terms for both dialects
        from_terms = self.config.AGRICULTURAL_TERMS.get(from_dialect, {})
        to_terms = self.config.AGRICULTURAL_TERMS.get(to_dialect, {})
        
        # Create a mapping
        term_mapping = {}
        for eng_term, from_local in from_terms.items():
            to_local = to_terms.get(eng_term)
            if to_local and from_local != to_local:
                term_mapping[from_local] = to_local
        
        # Sort by length for better matching
        sorted_terms = sorted(term_mapping.items(), key=lambda x: len(x[0]), reverse=True)
        
        # Replace terms in text using word boundaries
        import re
        for from_term, to_term in sorted_terms:
            pattern = r'\b' + re.escape(from_term) + r'\b'
            translated = re.sub(pattern, to_term, translated, flags=re.IGNORECASE)
        
        return translated
    
    def get_dialect_info(self, dialect_code: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific dialect"""
        info = self.config.get_dialect_info(dialect_code)
        if info:
            return {
                "code": info.code,
                "name": info.name,
                "native_name": info.native_name,
                "base_language": info.base_language,
                "region": info.region,
                "tts_supported": info.tts_supported,
                "stt_supported": info.stt_supported,
                "writing_system": info.writing_system
            }
        return None
    
    def auto_detect_and_normalize(
        self,
        text: str,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Automatically detect dialect and normalize to standard for AI processing
        
        Args:
            text: Input text
            user_context: User information (region, preferences, etc.)
            
        Returns:
            Complete processing result
        """
        user_context = user_context or {}
        
        # Extract user information
        user_region = user_context.get("region")
        user_dialect = user_context.get("preferred_dialect")
        
        # Detect dialect
        detection = self.detect_dialect(
            text=text,
            user_region=user_region,
            user_preferred_dialect=user_dialect
        )
        
        # Normalize to standard if needed
        normalization = self.normalize_to_standard(
            text=text,
            source_dialect=detection["dialect"],
            preserve_original=True
        )
        
        return {
            "original_text": text,
            "normalized_text": normalization["normalized_text"],
            "detected_dialect": detection["dialect"],
            "confidence": detection["confidence"],
            "base_language": detection["base_language"],
            "changes_made": normalization["changes_made"],
            "detection_source": detection["source"]
        }
    
    def prepare_response_in_dialect(
        self,
        ai_response: str,
        user_dialect: str,
        include_metadata: bool = False
    ) -> Any:
        """
        Prepare AI response in user's preferred dialect
        
        Args:
            ai_response: AI response in standard Bengali/English
            user_dialect: User's preferred dialect
            include_metadata: Include conversion metadata
            
        Returns:
            Response text or dict with metadata
        """
        # Convert to user's dialect
        conversion = self.convert_response_to_dialect(
            text=ai_response,
            target_dialect=user_dialect
        )
        
        if include_metadata:
            return conversion
        else:
            return conversion["converted_text"]
    
    def get_supported_dialects(self) -> List[Dict[str, Any]]:
        """Get list of all supported dialects"""
        return self.config.get_supported_languages()


# Global service instance
dialect_service = DialectDetectionService()
