import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.agenda import Agenda, AgendaPriority, AgendaType, AgendaStatus
from app.models.user import User
from app.models.form_data import FarmData
from app.services.agent import enhanced_agent
from app.tools.weather_tool import get_current_weather, get_weather_forecast, get_weather_alerts
from app.tools.iot_sensor_tool import get_latest_sensor_data, get_sensor_history, get_sensor_alerts
from app.tools.crop_tool import get_crop_calendar, get_fertilizer_recommendation


class AIAgendaService:
    def __init__(self):
        self.max_daily_suggestions = 5
        self.suggestion_cache_hours = 6
    
    async def generate_ai_agendas(
        self, 
        user_id: int, 
        db: Session,
        force_refresh: bool = False,
        max_suggestions: int = 5
    ) -> Dict[str, Any]:
        """Generate AI-powered agenda suggestions for a user"""
        
        # Get user and farm data
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"error": "User not found"}
        
        farm_data = db.query(FarmData).filter(FarmData.owner_id == user_id).first()
        
        # Check if we have recent AI suggestions (unless force refresh)
        if not force_refresh:
            recent_suggestions = db.query(Agenda).filter(
                and_(
                    Agenda.user_id == user_id,
                    Agenda.created_by_ai == True,
                    Agenda.created_at >= datetime.now() - timedelta(hours=self.suggestion_cache_hours)
                )
            ).count()
            
            if recent_suggestions >= 3:
                return {"message": "Recent AI suggestions available", "suggestions": []}
        
        # Gather context data
        context_data = await self._gather_context_data(user, farm_data, db)
        
        # Generate AI prompt for agenda suggestions
        ai_prompt = self._create_agenda_prompt(user, farm_data, context_data)
        
        try:
            # Get AI suggestions
            ai_response = await enhanced_agent.process_message(
                message=ai_prompt,
                user_context={
                    "user_id": user_id,
                    "user_name": user.full_name,
                    "location": f"{user.district}, {user.division}" if user.district else None,
                    "farm_data": farm_data.to_dict() if farm_data else None
                },
                language="bn"
            )
            
            # Parse AI response and create agenda suggestions
            suggestions = await self._parse_ai_response_to_agendas(
                ai_response.get("content", ""),
                user_id,
                context_data,
                db,
                max_suggestions
            )
            
            return {
                "suggestions": suggestions,
                "reasoning": ai_response.get("content", ""),
                "source_data_summary": self._create_source_summary(context_data),
                "generated_at": datetime.now(),
                "tool_outputs": ai_response.get("tool_outputs", {})
            }
            
        except Exception as e:
            print(f"Error generating AI agendas: {e}")
            return {"error": str(e)}
    
    async def _gather_context_data(self, user: User, farm_data: Optional[FarmData], db: Session) -> Dict[str, Any]:
        """Gather all relevant context data for AI agenda generation"""
        context = {
            "timestamp": datetime.now().isoformat(),
            "user_location": None,
            "weather_data": None,
            "sensor_data": None,
            "farm_info": None,
            "recent_agendas": None,
            "seasonal_info": None
        }
        
        # User location
        if user.latitude and user.longitude:
            context["user_location"] = {
                "lat": user.latitude,
                "lon": user.longitude,
                "district": user.district,
                "division": user.division
            }
            
            # Get weather data
            try:
                # Check if we have valid coordinates from farm data
                if farm_data and farm_data.latitude and farm_data.longitude:
                    current_weather = get_current_weather.invoke({
                        "latitude": farm_data.latitude,
                        "longitude": farm_data.longitude
                    })
                    weather_forecast = get_weather_forecast.invoke({
                        "latitude": farm_data.latitude,
                        "longitude": farm_data.longitude,
                        "days": 3
                    })
                    weather_alerts = get_weather_alerts.invoke({
                        "latitude": farm_data.latitude,
                        "longitude": farm_data.longitude
                    })
                    
                    context["weather_data"] = {
                        "current": current_weather,
                        "forecast": weather_forecast,
                        "alerts": weather_alerts
                    }
                    print(f"✅ Weather data retrieved for coordinates ({farm_data.latitude}, {farm_data.longitude})")
                else:
                    print(f"⚠️ No valid coordinates found in farm data for user {user.id}")
                    context["weather_data"] = {
                        "current": {"description": "No location data available"},
                        "forecast": "General Bangladesh weather conditions apply",
                        "alerts": "Unable to fetch weather alerts"
                    }
            except Exception as e:
                print(f"❌ Weather data error: {str(e)}")
                context["weather_data"] = {
                    "current": {"description": "Weather data unavailable"},
                    "forecast": "Unable to fetch weather information",
                    "alerts": "Weather alerts unavailable"
                }
        
        # Farm data
        if farm_data:
            context["farm_info"] = farm_data.to_dict()
            print(f"✅ Farm data included for user {user.id}")
            
            # Get crop calendar and recommendations
            try:
                if farm_data.current_crops:
                    crop_calendar = get_crop_calendar.invoke({
                        "crop_name": farm_data.current_crops.split(',')[0].strip(),
                        "location": user.district or "Bangladesh"
                    })
                    context["seasonal_info"] = crop_calendar
            except Exception as e:
                print(f"Crop calendar error: {e}")
        
        # Sensor data
        try:
            sensor_data = get_latest_sensor_data.invoke({"user_id": user.id})
            sensor_alerts = get_sensor_alerts.invoke({"user_id": user.id})
            
            context["sensor_data"] = {
                "latest": sensor_data,
                "alerts": sensor_alerts
            }
        except Exception as e:
            print(f"Sensor data error: {e}")
        
        # Recent agendas
        recent_agendas = db.query(Agenda).filter(
            and_(
                Agenda.user_id == user.id,
                Agenda.created_at >= datetime.now() - timedelta(days=7)
            )
        ).limit(10).all()
        
        context["recent_agendas"] = [
            {
                "title": agenda.title,
                "status": agenda.status.value,
                "type": agenda.agenda_type.value,
                "created_at": agenda.created_at.isoformat()
            }
            for agenda in recent_agendas
        ]
        
        return context
    
    def _create_agenda_prompt(self, user: User, farm_data: Optional[FarmData], context: Dict[str, Any]) -> str:
        """Create a comprehensive prompt for AI agenda generation"""
        
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        prompt = f"""
আজকের তারিখ: {current_date}

আমি একজন কৃষক {user.full_name}, বাংলাদেশের {user.district or 'একটি জেলায়'} বাস করি। 
আমার জন্য আজকের এবং আগামী কয়েকদিনের জন্য গুরুত্বপূর্ণ কৃষিকাজের একটি তালিকা তৈরি করুন।

আমার খামারের তথ্য:
{f"- খামারের ধরন: {farm_data.farm_type}" if farm_data and farm_data.farm_type else ""}
{f"- মোট জমি: {farm_data.total_area} শতক" if farm_data and farm_data.total_area else ""}
{f"- বর্তমান ফসল: {farm_data.current_crops}" if farm_data and farm_data.current_crops else ""}
{f"- মাটির ধরন: {farm_data.soil_type}" if farm_data and farm_data.soil_type else ""}
{f"- সেচের উৎস: {farm_data.irrigation_source}" if farm_data and farm_data.irrigation_source else ""}

বিবেচনা করার বিষয়সমূহ:
1. বর্তমান আবহাওয়া এবং আগামী ৩ দিনের পূর্বাভাস
2. সেন্সর ডেটা থেকে মাটি ও পরিবেশের অবস্থা
3. ফসলের ক্যালেন্ডার অনুযায়ী এখন কী কাজ করা দরকার
4. আবহাওয়ার সতর্কতা
5. সেন্সরের সতর্কতা

নির্দেশনা:
- প্রতিটি কাজের জন্য অগ্রাধিকার নির্ধারণ করুন (উচ্চ/মাঝারি/কম)
- কাজের ধরন উল্লেখ করুন (যেমন: সেচ, সার প্রয়োগ, আগাছা পরিষ্কার)
- কেন এই কাজটি গুরুত্বপূর্ণ তার কারণ দিন
- কাজ সম্পন্ন করতে আনুমানিক কত সময় লাগবে
- কোন দিন এই কাজটি করা উচিত

সর্বোচ্চ ৫টি কাজের তালিকা দিন, সবচেয়ে গুরুত্বপূর্ণ কাজ আগে রাখুন।

উপলব্ধ তথ্য ব্যবহার করে আমার খামারের জন্য সবচেয়ে উপযুক্ত পরামর্শ দিন।
"""
        
        return prompt
    
    async def _parse_ai_response_to_agendas(
        self, 
        ai_response: str, 
        user_id: int, 
        context_data: Dict[str, Any],
        db: Session,
        max_suggestions: int
    ) -> List[Dict[str, Any]]:
        """Parse AI response and create agenda objects"""
        
        # Simple parsing logic - in production, you might want more sophisticated parsing
        suggestions = []
        
        # For now, create some intelligent default agendas based on context
        today = datetime.now()
        
        # Weather-based suggestions
        weather_data = context_data.get("weather_data", {})
        if weather_data:
            current = weather_data.get("current", {})
            forecast = weather_data.get("forecast", {})
            
            # Rain check
            if current and "rain" in str(current).lower():
                suggestions.append({
                    "title": "বৃষ্টির কারণে জমির পানি নিষ্কাশন পরীক্ষা",
                    "description": "বৃষ্টির পর জমিতে অতিরিক্ত পানি জমে আছে কিনা দেখুন এবং প্রয়োজনে নিষ্কাশনের ব্যবস্থা করুন।",
                    "priority": AgendaPriority.HIGH,
                    "agenda_type": AgendaType.WEATHER_ALERT,
                    "scheduled_date": today,
                    "estimated_duration": 30,
                    "ai_reasoning": "আবহাওয়া তথ্য অনুযায়ী বৃষ্টি হয়েছে, তাই জমির পানি নিষ্কাশন পরীক্ষা প্রয়োজন।"
                })
        
        # Sensor-based suggestions
        sensor_data = context_data.get("sensor_data", {})
        if sensor_data and sensor_data.get("latest"):
            latest = sensor_data["latest"]
            if isinstance(latest, dict):
                # Soil moisture check
                if latest.get("soil_moisture", 0) < 30:
                    suggestions.append({
                        "title": "জমিতে সেচ দেওয়া প্রয়োজন",
                        "description": f"সেন্সর অনুযায়ী মাটির আর্দ্রতা {latest.get('soil_moisture', 0)}%, সেচের প্রয়োজন।",
                        "priority": AgendaPriority.HIGH,
                        "agenda_type": AgendaType.IRRIGATION,
                        "scheduled_date": today,
                        "estimated_duration": 60,
                        "ai_reasoning": "সেন্সর ডেটা অনুযায়ী মাটির আর্দ্রতা কম, তাই সেচের প্রয়োজন।"
                    })
        
        # Seasonal suggestions based on current date
        month = today.month
        if month in [11, 12, 1]:  # Winter season
            suggestions.append({
                "title": "শীতকালীন সবজির বীজ বপন",
                "description": "শীতকালীন সবজি যেমন মুলা, গাজর, পালং শাক এর বীজ বপনের উপযুক্ত সময়।",
                "priority": AgendaPriority.MEDIUM,
                "agenda_type": AgendaType.PLANTING,
                "scheduled_date": today + timedelta(days=1),
                "estimated_duration": 120,
                "ai_reasoning": "শীতকাল শুরু হয়েছে, শীতকালীন সবজি বপনের উপযুক্ত সময়।"
            })
        
        # Farm maintenance
        suggestions.append({
            "title": "কৃষি যন্ত্রপাতি রক্ষণাবেক্ষণ",
            "description": "কৃষি যন্ত্রপাতি পরিষ্কার ও তেল দেওয়া, ক্ষতিগ্রস্ত অংশ মেরামত করা।",
            "priority": AgendaPriority.LOW,
            "agenda_type": AgendaType.MAINTENANCE,
            "scheduled_date": today + timedelta(days=2),
            "estimated_duration": 90,
            "ai_reasoning": "নিয়মিত যন্ত্রপাতি রক্ষণাবেক্ষণ ফসল উৎপাদনে সহায়তা করে।"
        })
        
        # Create agenda objects in database
        created_agendas = []
        for suggestion in suggestions[:max_suggestions]:
            try:
                agenda = Agenda(
                    title=suggestion["title"],
                    description=suggestion["description"],
                    priority=suggestion["priority"],
                    agenda_type=suggestion["agenda_type"],
                    scheduled_date=suggestion.get("scheduled_date"),
                    estimated_duration=suggestion.get("estimated_duration"),
                    user_id=user_id,
                    created_by_ai=True,
                    ai_reasoning=suggestion.get("ai_reasoning"),
                    source_data=json.dumps(context_data, default=str, ensure_ascii=False)
                )
                
                db.add(agenda)
                db.commit()
                db.refresh(agenda)
                created_agendas.append(agenda.to_dict())
                
            except Exception as e:
                print(f"Error creating agenda: {e}")
                db.rollback()
        
        return created_agendas
    
    def _create_source_summary(self, context_data: Dict[str, Any]) -> str:
        """Create a summary of data sources used"""
        sources = []
        
        if context_data.get("weather_data"):
            sources.append("আবহাওয়া তথ্য")
        if context_data.get("sensor_data"):
            sources.append("সেন্সর ডেটা")
        if context_data.get("farm_info"):
            sources.append("খামারের তথ্য")
        if context_data.get("seasonal_info"):
            sources.append("ফসলের ক্যালেন্ডার")
        if context_data.get("recent_agendas"):
            sources.append("সাম্প্রতিক কাজের তালিকা")
        
        return ", ".join(sources) if sources else "সাধারণ কৃষি জ্ঞান"
    
    async def get_user_agendas(
        self, 
        user_id: int, 
        db: Session,
        status_filter: Optional[str] = None,
        limit: int = 20
    ) -> Dict[str, Any]:
        """Get user's agendas with statistics"""
        
        query = db.query(Agenda).filter(Agenda.user_id == user_id)
        
        if status_filter:
            query = query.filter(Agenda.status == status_filter)
        
        agendas = query.order_by(
            Agenda.priority.desc(),
            Agenda.scheduled_date.asc()
        ).limit(limit).all()
        
        # Calculate statistics
        total = db.query(Agenda).filter(Agenda.user_id == user_id).count()
        pending = db.query(Agenda).filter(
            and_(Agenda.user_id == user_id, Agenda.status == AgendaStatus.PENDING)
        ).count()
        completed = db.query(Agenda).filter(
            and_(Agenda.user_id == user_id, Agenda.status == AgendaStatus.COMPLETED)
        ).count()
        ai_suggested = db.query(Agenda).filter(
            and_(Agenda.user_id == user_id, Agenda.created_by_ai == True)
        ).count()
        
        return {
            "agendas": [agenda.to_dict() for agenda in agendas],
            "total": total,
            "pending": pending,
            "completed": completed,
            "ai_suggested": ai_suggested
        }


# Global instance
ai_agenda_service = AIAgendaService()
