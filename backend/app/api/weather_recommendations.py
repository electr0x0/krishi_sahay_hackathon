from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import json

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.services.agent import EnhancedAgentService
from app.tools.weather_tool import get_current_weather, get_weather_forecast
from app.tools.crop_tool import get_crop_calendar, get_fertilizer_recommendation, diagnose_crop_disease

router = APIRouter()

# Bengali translations for weather conditions
WEATHER_TRANSLATIONS = {
    "clear sky": "পরিষ্কার আকাশ",
    "few clouds": "কয়েকটি মেঘ", 
    "scattered clouds": "বিক্ষিপ্ত মেঘ",
    "broken clouds": "ভাঙা মেঘ",
    "overcast clouds": "মেঘাচ্ছন্ন আকাশ",
    "light rain": "হালকা বৃষ্টি",
    "moderate rain": "মাঝারি বৃষ্টি",
    "heavy intensity rain": "ভারী বৃষ্টি",
    "very heavy rain": "অতি ভারী বৃষ্টি",
    "extreme rain": "চরম বৃষ্টি",
    "freezing rain": "হিমায়িত বৃষ্টি",
    "light intensity shower rain": "হালকা বর্ষণ",
    "shower rain": "বর্ষণ",
    "heavy intensity shower rain": "ভারী বর্ষণ",
    "ragged shower rain": "অসমান বর্ষণ",
    "thunderstorm": "বজ্রঝড়",
    "thunderstorm with light rain": "হালকা বৃষ্টিসহ বজ্রঝড়",
    "thunderstorm with rain": "বৃষ্টিসহ বজ্রঝড়",
    "thunderstorm with heavy rain": "ভারী বৃষ্টিসহ বজ্রঝড়",
    "light thunderstorm": "হালকা বজ্রঝড়",
    "heavy thunderstorm": "ভারী বজ্রঝড়",
    "ragged thunderstorm": "অসমান বজ্রঝড়",
    "thunderstorm with light drizzle": "হালকা গুঁড়ি গুঁড়ি বৃষ্টিসহ বজ্রঝড়",
    "thunderstorm with drizzle": "গুঁড়ি গুঁড়ি বৃষ্টিসহ বজ্রঝড়",
    "thunderstorm with heavy drizzle": "ভারী গুঁড়ি গুঁড়ি বৃষ্টিসহ বজ্রঝড়",
    "light intensity drizzle": "হালকা গুঁড়ি গুঁড়ি বৃষ্টি",
    "drizzle": "গুঁড়ি গুঁড়ি বৃষ্টি", 
    "heavy intensity drizzle": "ভারী গুঁড়ি গুঁড়ি বৃষ্টি",
    "light intensity drizzle rain": "হালকা গুঁড়ি গুঁড়ি বৃষ্টি",
    "drizzle rain": "গুঁড়ি গুঁড়ি বৃষ্টি",
    "heavy intensity drizzle rain": "ভারী গুঁড়ি গুঁড়ি বৃষ্টি",
    "shower rain and drizzle": "বর্ষণ এবং গুঁড়ি গুঁড়ি বৃষ্টি",
    "heavy shower rain and drizzle": "ভারী বর্ষণ এবং গুঁড়ি গুঁড়ি বৃষ্টি",
    "shower drizzle": "গুঁড়ি গুঁড়ি বর্ষণ",
    "light snow": "হালকা তুষারপাত",
    "snow": "তুষারপাত",
    "heavy snow": "ভারী তুষারপাত",
    "sleet": "শীত বৃষ্টি",
    "light shower sleet": "হালকা শীত বর্ষণ",
    "shower sleet": "শীত বর্ষণ",
    "light rain and snow": "হালকা বৃষ্টি ও তুষারপাত",
    "rain and snow": "বৃষ্টি ও তুষারপাত",
    "light shower snow": "হালকা তুষার বর্ষণ",
    "shower snow": "তুষার বর্ষণ",
    "heavy shower snow": "ভারী তুষার বর্ষণ",
    "mist": "কুয়াশা",
    "smoke": "ধোঁয়া",
    "haze": "ধোঁয়াশা",
    "sand/dust whirls": "বালি/ধুলার ঘূর্ণি",
    "fog": "ঘন কুয়াশা",
    "sand": "বালি",
    "dust": "ধুলা",
    "volcanic ash": "আগ্নেয়গিরির ছাই",
    "squalls": "ঝড়ো হাওয়া",
    "tornado": "টর্নেডো"
}

def translate_weather_condition(condition: str) -> str:
    """Translate English weather condition to Bengali"""
    return WEATHER_TRANSLATIONS.get(condition.lower(), condition)

@router.post("/weather-recommendations")
async def get_weather_recommendations(
    location: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered farming recommendations based on current weather and forecast
    """
    try:
        # Use user's district if no location provided
        if not location and not (lat and lon):
            location = current_user.district or "Dhaka"
        
        # Get weather data
        current_weather = get_current_weather.invoke({
            "location": location,
            "lat": lat,
            "lon": lon
        })
        
        if "error" in current_weather:
            raise HTTPException(status_code=400, detail=current_weather["error"])
        
        forecast_data = get_weather_forecast.invoke({
            "location": location,
            "lat": lat,
            "lon": lon,
            "days": 5
        })
        
        if "error" in forecast_data:
            raise HTTPException(status_code=400, detail=forecast_data["error"])
        
        # Prepare context for AI agent
        weather_context = f"""
        Current Weather in {current_weather.get('name', location)}:
        - Temperature: {current_weather['main']['temp']}°C
        - Feels like: {current_weather['main']['feels_like']}°C
        - Humidity: {current_weather['main']['humidity']}%
        - Wind Speed: {current_weather['wind']['speed']} m/s
        - Condition: {current_weather['weather'][0]['description']}
        - Pressure: {current_weather['main']['pressure']} hPa
        
        5-Day Forecast Summary:
        """
        
        # Add forecast summary
        for i, forecast_item in enumerate(forecast_data['list'][:8]):  # Next 24 hours
            dt = forecast_item['dt_txt']
            temp = forecast_item['main']['temp']
            condition = forecast_item['weather'][0]['description']
            wind = forecast_item['wind']['speed']
            humidity = forecast_item['main']['humidity']
            
            weather_context += f"\n{dt}: {temp}°C, {condition}, Wind: {wind}m/s, Humidity: {humidity}%"
        
        # Create AI agent prompt
        agent_prompt = f"""
        Based on the current weather conditions and forecast data provided below, generate farming advice for farmers in Bangladesh. 
        
        Weather Data:
        {weather_context}
        
        You must respond with ONLY a valid JSON object containing farming recommendations. Do not include any explanatory text, markdown formatting, or code blocks. 
        
        Structure the response exactly like this:
        {{
          "irrigation": {{
            "recommended": true/false,
            "reason": "Bengali explanation",
            "reasonEn": "English explanation"
          }},
          "spraying": {{
            "suitable": true/false,
            "reason": "Bengali explanation", 
            "reasonEn": "English explanation"
          }},
          "harvesting": {{
            "suitable": true/false,
            "reason": "Bengali explanation",
            "reasonEn": "English explanation"
          }},
          "planting": {{
            "suitable": true/false,
            "reason": "Bengali explanation",
            "reasonEn": "English explanation"
          }},
          "field_work": {{
            "suitable": true/false,
            "reason": "Bengali explanation",
            "reasonEn": "English explanation"
          }},
          "fertilizer_application": {{
            "recommended": true/false,
            "reason": "Bengali explanation",
            "reasonEn": "English explanation"
          }}
        }}
        
        Consider these factors:
        - Temperature extremes (>35°C too hot, <10°C too cold)
        - Wind speed (>5 m/s too windy for spraying)
        - High humidity (may affect disease spread)
        - Rain probability in next 24 hours
        - Current weather conditions
        
        Provide practical advice in simple Bengali language that farmers can easily understand.
        """
        
        # Get AI recommendations
        agent_service = EnhancedAgentService()
        ai_response = await agent_service.process_message(agent_prompt)
        
        # Parse AI response to extract JSON
        recommendations = {}
        try:
            # Try to parse the AI response content
            ai_content = ai_response.get('content', '')
            
            # Handle the content based on its type
            if isinstance(ai_content, list):
                # If it's a list, take the first item
                content_text = ai_content[0] if ai_content else ''
            else:
                # If it's already a string, use it directly  
                content_text = str(ai_content)
                
            print(f"Content to parse: {content_text[:200]}...")  # Debug log
                
            # Remove markdown code blocks if present
            if "```json" in content_text:
                start = content_text.find("```json") + 7
                end = content_text.rfind("```")
                if end > start:
                    content_text = content_text[start:end].strip()
            elif "```" in content_text:
                start = content_text.find("```") + 3
                end = content_text.rfind("```")
                if end > start:
                    content_text = content_text[start:end].strip()
            
            # Find JSON object boundaries
            start_brace = content_text.find('{')
            end_brace = content_text.rfind('}')
            
            if start_brace != -1 and end_brace != -1 and end_brace > start_brace:
                json_text = content_text[start_brace:end_brace + 1]
                recommendations = json.loads(json_text)
                print(f"Successfully parsed recommendations: {list(recommendations.keys())}")  # Debug log
            else:
                # Try parsing the whole cleaned content
                recommendations = json.loads(content_text.strip())
                print(f"Successfully parsed full content: {list(recommendations.keys())}")  # Debug log
                
        except (json.JSONDecodeError, TypeError, IndexError, AttributeError) as e:
            print(f"Failed to parse AI response as JSON: {e}")
            print(f"Raw AI Response: {ai_response}")
            print(f"Content text: {content_text[:500]}...")
            
            # Fallback to simple recommendations
            recommendations = {
                "irrigation": {
                    "recommended": current_weather['main']['temp'] > 30,
                    "reason": "তাপমাত্রার ভিত্তিতে সেচের পরামর্শ।",
                    "reasonEn": "Irrigation advice based on temperature."
                },
                "spraying": {
                    "suitable": current_weather['wind']['speed'] < 5,
                    "reason": "বাতাসের গতির ভিত্তিতে স্প্রে পরামর্শ।",
                    "reasonEn": "Spraying advice based on wind speed."
                },
                "harvesting": {
                    "suitable": current_weather['weather'][0]['main'] != 'Rain',
                    "reason": "আবহাওয়ার অবস্থার ভিত্তিতে ফসল কাটার পরামর্শ।",
                    "reasonEn": "Harvesting advice based on weather conditions."
                },
                "planting": {
                    "suitable": True,
                    "reason": "সাধারণ রোপণ পরামর্শ।",
                    "reasonEn": "General planting advice."
                }
            }
        
        # Translate weather conditions to Bengali
        current_weather_bn = current_weather.copy()
        current_weather_bn['weather'][0]['description_bn'] = translate_weather_condition(
            current_weather['weather'][0]['description']
        )
        
        # Translate forecast conditions
        forecast_data_bn = forecast_data.copy()
        for item in forecast_data_bn['list']:
            item['weather'][0]['description_bn'] = translate_weather_condition(
                item['weather'][0]['description']
            )
        
        return {
            "success": True,
            "location": current_weather.get('name', location),
            "current_weather": current_weather_bn,
            "forecast": forecast_data_bn,
            "ai_recommendations": recommendations,
            "raw_ai_response": ai_response,
            "weather_translations": WEATHER_TRANSLATIONS
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@router.get("/weather-translations")
async def get_weather_translations():
    """Get Bengali translations for weather conditions"""
    return {
        "success": True,
        "translations": WEATHER_TRANSLATIONS
    }

@router.post("/test-ai-parsing")
async def test_ai_parsing():
    """Test endpoint for debugging AI response parsing"""
    test_response = {
        "content": "```json\n{\n  \"irrigation\": {\n    \"recommended\": false,\n    \"reason\": \"বৃষ্টির সম্ভাবনা এবং বাতাসে আর্দ্রতা বেশি থাকায় এখন সেচ দেওয়ার প্রয়োজন নেই।\",\n    \"reasonEn\": \"No irrigation is needed now due to the possibility of rain and high humidity in the air.\"\n  },\n  \"spraying\": {\n    \"suitable\": false,\n    \"reason\": \"বাতাসের গতি বেশি (৫.২৯ মি/সেকেন্ড) এবং বৃষ্টির পূর্বাভাস থাকায় স্প্রে করা ঠিক হবে না। এতে স্প্রে ধুয়ে যেতে পারে বা কার্যকর নাও হতে পারে।\",\n    \"reasonEn\": \"Spraying is not suitable due to high wind speed (5.29 m/s) and rain forecast. The spray might wash away or be ineffective.\"\n  },\n  \"harvesting\": {\n    \"suitable\": false,\n    \"reason\": \"বৃষ্টির পূর্বাভাস থাকায় ফসল কাটা এখন উপযুক্ত নয়। এতে কাটা ফসলের মান খারাপ হতে পারে বা পচন ধরতে পারে।\",\n    \"reasonEn\": \"Harvesting is not suitable now due to the rain forecast. It may degrade the quality of harvested crops or cause spoilage.\"\n  },\n  \"planting\": {\n    \"suitable\": true,\n    \"reason\": \"হালকা বৃষ্টির সম্ভাবনা থাকায় এবং তাপমাত্রা অনুকূল থাকায় চারা রোপণ বা বীজ বপনের জন্য এটি একটি ভালো সময়, যদি জমিতে অতিরিক্ত পানি জমে না থাকে।\",\n    \"reasonEn\": \"With the possibility of light rain and favorable temperatures, it's a good time for planting seedlings or sowing seeds, provided there is no excessive waterlogging in the field.\"\n  },\n  \"field_work\": {\n    \"suitable\": false,\n    \"reason\": \"মাঝে মাঝে হালকা বৃষ্টির পূর্বাভাস থাকায় এবং মাটি ভেজা থাকার কারণে ভারী মাঠের কাজ যেমন জমি তৈরি বা নিড়ানি দেওয়া কষ্টকর হতে পারে।\",\n    \"reasonEn\": \"Heavy field work like land preparation or weeding might be difficult due to intermittent light rain forecast and wet soil.\"\n  },\n  \"fertilizer_application\": {\n    \"recommended\": true,\n    \"reason\": \"হালকা বৃষ্টির সম্ভাবনা থাকায় সার প্রয়োগ করা যেতে পারে, কারণ বৃষ্টি সারকে মাটির সাথে মিশতে সাহায্য করবে। তবে বেশি বৃষ্টি হলে সার ধুয়ে যেতে পারে।\",\n    \"reasonEn\": \"Fertilizer application can be done due to the possibility of light rain, as rain will help mix the fertilizer with the soil. However, heavy rain might wash away the fertilizer.\"\n  }\n}\n```"
    }
    
    # Test parsing logic
    ai_content = test_response.get('content', '')
    content_text = str(ai_content)
    
    # Remove markdown code blocks if present
    if "```json" in content_text:
        start = content_text.find("```json") + 7
        end = content_text.rfind("```")
        if end > start:
            content_text = content_text[start:end].strip()
    elif "```" in content_text:
        start = content_text.find("```") + 3
        end = content_text.rfind("```")
        if end > start:
            content_text = content_text[start:end].strip()
    
    # Find JSON object boundaries
    start_brace = content_text.find('{')
    end_brace = content_text.rfind('}')
    
    recommendations = {}
    if start_brace != -1 and end_brace != -1 and end_brace > start_brace:
        json_text = content_text[start_brace:end_brace + 1]
        try:
            recommendations = json.loads(json_text)
        except json.JSONDecodeError as e:
            return {
                "error": f"JSON parsing failed: {e}",
                "raw_content": content_text[:500],
                "json_text": json_text[:500]
            }
    
    return {
        "success": True,
        "original_content": ai_content[:200] + "...",
        "cleaned_content": content_text[:200] + "...", 
        "parsed_recommendations": recommendations,
        "recommendation_keys": list(recommendations.keys()) if recommendations else []
    }
