"""
Enhanced Plant Disease Detection Service
Combines YOLO v11 detection with Gemini 2.5 Flash AI analysis
"""

import base64
import json
import time
from typing import Dict, List, Optional, Tuple
import logging

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import GOOGLE_API_KEY

logger = logging.getLogger(__name__)


class GeminiDetectionAnalyzer:
    """
    Combines YOLO detection results with Gemini AI analysis
    for comprehensive plant disease assessment
    """
    
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.3  # Lower temperature for more consistent analysis
        )
    
    def _create_analysis_prompt(self, yolo_detections: List[Dict], image_base64: str) -> List:
        """Create a comprehensive prompt for Gemini analysis"""
        
        # Prepare YOLO detection summary
        detection_summary = "YOLO সনাক্তকরণ ফলাফল:\n"
        if not yolo_detections:
            detection_summary += "কোনো রোগ সনাক্ত করা যায়নি (সুস্থ উদ্ভিদ)\n"
        else:
            for idx, det in enumerate(yolo_detections, 1):
                detection_summary += f"{idx}. {det['class_name']} (আত্মবিশ্বাস: {det['confidence']:.2%}, তীব্রতা: {det['severity']})\n"
        
        system_prompt = """আপনি একজন বিশেষজ্ঞ উদ্ভিদ রোগ বিশ্লেষক এবং কৃষি পরামর্শদাতা।
আপনার কাজ হল YOLO মডেল দ্বারা সনাক্ত করা রোগের উপর ভিত্তি করে বিস্তারিত বিশ্লেষণ প্রদান করা।

আপনাকে ONLY বাংলায় উত্তর দিতে হবে। JSON ফরম্যাটে নিম্নলিখিত তথ্য প্রদান করুন:

{
  "growth_stage": "বৃদ্ধির পর্যায় (যেমন: চারা অবস্থা, বৃদ্ধির পর্যায়, ফুল ধরার পর্যায়, ফল ধরার পর্যায়)",
  "growth_stage_en": "Growth stage in English",
  "plant_health_score": 0-100 এর মধ্যে স্বাস্থ্য স্কোর (100 = সম্পূর্ণ সুস্থ),
  "ai_disease_analysis": "রোগের বিস্তারিত বিশ্লেষণ বাংলায় (প্রতিটি সনাক্ত রোগের লক্ষণ, কারণ, প্রভাব)",
  "treatment_recommendations": "চিকিৎসার সুপারিশ বাংলায় (ধাপে ধাপে চিকিৎসা পদ্ধতি, প্রয়োজনীয় ওষুধ/রাসায়নিক, প্রয়োগ পদ্ধতি)",
  "preventive_measures": "প্রতিরোধমূলক ব্যবস্থা বাংলায় (ভবিষ্যতে রোগ এড়ানোর উপায়, সাধারণ যত্ন নির্দেশিকা)",
  "expected_recovery_time": "প্রত্যাশিত সুস্থ হওয়ার সময় (যেমন: ৭-১৪ দিন, ২-৩ সপ্তাহ)",
  "severity_assessment": "সামগ্রিক তীব্রতা মূল্যায়ন (হালকা/মাঝারি/গুরুতর/অত্যন্ত গুরুতর)",
  "additional_observations": "অতিরিক্ত পর্যবেক্ষণ বা পরামর্শ বাংলায়"
}

গুরুত্বপূর্ণ নির্দেশনা:
- সব উত্তর বাংলায় দিন (শুধুমাত্র growth_stage_en ইংরেজিতে)
- কৃষকদের জন্য সহজ ভাষায় লিখুন
- বাংলাদেশের প্রেক্ষাপটে প্রযোজ্য পরামর্শ দিন
- স্থানীয়ভাবে পাওয়া যায় এমন চিকিৎসা পদ্ধতি সুপারিশ করুন
- যদি কোনো রোগ না থাকে, তাহলে সুস্থ উদ্ভিদের যত্ন নির্দেশিকা দিন
- JSON ফরম্যাট সঠিকভাবে মেনে চলুন
"""
        
        user_prompt = f"""{detection_summary}

উপরের YOLO সনাক্তকরণের উপর ভিত্তি করে এবং সংযুক্ত ছবি দেখে, অনুগ্রহ করে একটি বিস্তারিত বিশ্লেষণ প্রদান করুন।

ছবিটি মনোযোগ সহকারে পর্যবেক্ষণ করুন এবং:
১. উদ্ভিদের বর্তমান বৃদ্ধির পর্যায় নির্ধারণ করুন
২. পাতার রঙ, দাগ, বিবর্ণতা, শুকিয়ে যাওয়া ইত্যাদি লক্ষণ বিশ্লেষণ করুন
৩. রোগের তীব্রতা মূল্যায়ন করুন
৪. ব্যবহারিক চিকিৎসা ও প্রতিরোধমূলক ব্যবস্থা সুপারিশ করুন

JSON ফরম্যাটে উত্তর দিন।"""

        # Create messages with image
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(
                content=[
                    {"type": "text", "text": user_prompt},
                    {
                        "type": "image_url",
                        "image_url": f"data:image/jpeg;base64,{image_base64}"
                    }
                ]
            )
        ]
        
        return messages
    
    async def analyze_with_gemini(
        self,
        yolo_detections: List[Dict],
        image_path: str
    ) -> Dict:
        """
        Perform comprehensive AI analysis using Gemini
        
        Args:
            yolo_detections: List of YOLO detection results
            image_path: Path to the plant image
            
        Returns:
            Dictionary containing AI analysis results
        """
        start_time = time.time()
        
        try:
            # Read and encode image
            with open(image_path, "rb") as image_file:
                image_base64 = base64.b64encode(image_file.read()).decode()
            
            # Create analysis prompt
            messages = self._create_analysis_prompt(yolo_detections, image_base64)
            
            # Get Gemini response
            logger.info("Sending request to Gemini for disease analysis...")
            response = await self.llm.ainvoke(messages)
            
            # Extract and parse JSON response
            response_text = response.content
            
            # Try to extract JSON from response
            # Sometimes Gemini wraps JSON in markdown code blocks
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            
            # Parse JSON
            try:
                analysis_data = json.loads(response_text)
            except json.JSONDecodeError:
                # If JSON parsing fails, create a structured response from text
                logger.warning("Failed to parse JSON from Gemini response, using fallback")
                analysis_data = {
                    "growth_stage": "বিশ্লেষণ করা যায়নি",
                    "growth_stage_en": "Unable to analyze",
                    "plant_health_score": 50.0,
                    "ai_disease_analysis": response_text,
                    "treatment_recommendations": "বিস্তারিত পরামর্শের জন্য কৃষি বিশেষজ্ঞের সাথে যোগাযোগ করুন।",
                    "preventive_measures": "নিয়মিত পরিচর্যা এবং পর্যবেক্ষণ চালিয়ে যান।",
                    "expected_recovery_time": "১-২ সপ্তাহ",
                    "severity_assessment": "মাঝারি",
                    "additional_observations": ""
                }
            
            # Add English translations for disease analysis
            analysis_data["ai_disease_analysis_en"] = self._translate_to_english(
                analysis_data.get("ai_disease_analysis", "")
            )
            analysis_data["treatment_recommendations_en"] = self._translate_to_english(
                analysis_data.get("treatment_recommendations", "")
            )
            analysis_data["preventive_measures_en"] = self._translate_to_english(
                analysis_data.get("preventive_measures", "")
            )
            
            # Calculate processing time
            processing_time = time.time() - start_time
            analysis_data["gemini_processing_time"] = processing_time
            
            logger.info(f"Gemini analysis completed in {processing_time:.2f} seconds")
            
            return analysis_data
            
        except Exception as e:
            logger.error(f"Error during Gemini analysis: {str(e)}")
            # Return default analysis on error
            return {
                "growth_stage": "বিশ্লেষণ করা যায়নি",
                "growth_stage_en": "Unable to analyze",
                "plant_health_score": None,
                "ai_disease_analysis": f"AI বিশ্লেষণে ত্রুটি ঘটেছে: {str(e)}",
                "ai_disease_analysis_en": f"Error in AI analysis: {str(e)}",
                "treatment_recommendations": "YOLO সনাক্তকরণ ফলাফলের উপর ভিত্তি করে চিকিৎসা করুন।",
                "treatment_recommendations_en": "Proceed with treatment based on YOLO detection results.",
                "preventive_measures": "সাধারণ উদ্ভিদ যত্ন নির্দেশিকা অনুসরণ করুন।",
                "preventive_measures_en": "Follow general plant care guidelines.",
                "expected_recovery_time": "অজানা",
                "severity_assessment": "অনির্ধারিত",
                "additional_observations": "",
                "gemini_processing_time": time.time() - start_time
            }
    
    def _translate_to_english(self, bengali_text: str) -> str:
        """
        Simple translation mapping for common terms
        (In production, you might want to use a proper translation service)
        """
        # For now, return a placeholder
        # You can integrate a proper translation service here
        return f"(Translation: {bengali_text[:100]}...)" if bengali_text else ""


# Global instance
gemini_analyzer = GeminiDetectionAnalyzer()

