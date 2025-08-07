from datetime import datetime, timedelta
from langchain_core.tools import tool
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sensor import SensorData, SensorConfig

@tool
def get_latest_sensor_data(sensor_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Get the latest IoT sensor data from the farm monitoring system.
    
    Args:
        sensor_type: Optional filter by sensor type (e.g., 'temperature', 'humidity', 'soil', 'water')
    
    Returns:
        Latest sensor readings including temperature, humidity, soil moisture, and water level
    """
    try:
        # Get database session
        db = next(get_db())
        
        # Get the latest sensor data
        latest_data = db.query(SensorData).order_by(SensorData.recorded_at.desc()).first()
        
        if not latest_data:
            return {
                "error": "No sensor data available",
                "message": "কোনো সেন্সর ডেটা পাওয়া যায়নি। IoT ডিভাইস সংযুক্ত আছে কিনা পরীক্ষা করুন।"
            }
        
        # Format the response
        response = {
            "timestamp": latest_data.recorded_at.isoformat(),
            "temperature_c": latest_data.temperature,
            "humidity_percent": latest_data.humidity,
            "soil_moisture_percent": latest_data.soil_moisture,
            "water_level_percent": latest_data.water_level,
            "device_status": latest_data.device_status,
            "data_quality": latest_data.data_quality,
            "readings_age_minutes": (datetime.now() - latest_data.recorded_at).total_seconds() / 60,
            "status": "success"
        }
        
        # Add contextual information
        if response["readings_age_minutes"] > 30:
            response["warning"] = "সেন্সর ডেটা ৩০ মিনিটের বেশি পুরানো। ডিভাইস সংযোগ পরীক্ষা করুন।"
        
        # Add farming advice based on readings
        advice = []
        
        if latest_data.temperature and latest_data.temperature > 35:
            advice.append("তাপমাত্রা খুব বেশি। গাছপালাকে ছায়া দিন এবং বেশি পানি দিন।")
        elif latest_data.temperature and latest_data.temperature < 15:
            advice.append("তাপমাত্রা কম। ঠান্ডার হাত থেকে ফসল রক্ষা করুন।")
        
        if latest_data.humidity and latest_data.humidity > 85:
            advice.append("আর্দ্রতা বেশি। ছত্রাক রোগের ঝুঁকি। বাতাস চলাচলের ব্যবস্থা করুন।")
        elif latest_data.humidity and latest_data.humidity < 40:
            advice.append("আর্দ্রতা কম। গাছে পানি স্প্রে করুন।")
        
        if latest_data.soil_moisture and latest_data.soil_moisture < 30:
            advice.append("মাটির আর্দ্রতা কম। সেচ দেওয়ার প্রয়োজন।")
        elif latest_data.soil_moisture and latest_data.soil_moisture > 80:
            advice.append("মাটিতে অতিরিক্ত পানি। জল নিষ্কাশনের ব্যবস্থা করুন।")
        
        if latest_data.water_level and latest_data.water_level < 20:
            advice.append("পানির ট্যাংক প্রায় খালি। পানি ভর্তি করুন।")
        
        if advice:
            response["farming_advice"] = advice
        
        db.close()
        return response
        
    except Exception as e:
        return {
            "error": f"Failed to fetch sensor data: {str(e)}",
            "message": "সেন্সর ডেটা পেতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
        }

@tool
def get_sensor_history(hours: int = 24, limit: int = 50) -> Dict[str, Any]:
    """
    Get historical IoT sensor data for trend analysis.
    
    Args:
        hours: Number of hours to look back (default: 24)
        limit: Maximum number of readings to return (default: 50)
    
    Returns:
        Historical sensor readings with trend analysis
    """
    try:
        # Get database session
        db = next(get_db())
        
        # Calculate start time
        start_time = datetime.now() - timedelta(hours=hours)
        
        # Get historical data
        historical_data = db.query(SensorData).filter(
            SensorData.recorded_at >= start_time
        ).order_by(SensorData.recorded_at.desc()).limit(limit).all()
        
        if not historical_data:
            return {
                "error": "No historical data available",
                "message": f"গত {hours} ঘন্টার কোনো ডেটা পাওয়া যায়নি।"
            }
        
        # Calculate trends and averages
        temps = [d.temperature for d in historical_data if d.temperature is not None]
        humidities = [d.humidity for d in historical_data if d.humidity is not None]
        soil_moistures = [d.soil_moisture for d in historical_data if d.soil_moisture is not None]
        water_levels = [d.water_level for d in historical_data if d.water_level is not None]
        
        response = {
            "period_hours": hours,
            "total_readings": len(historical_data),
            "latest_reading": historical_data[0].recorded_at.isoformat(),
            "oldest_reading": historical_data[-1].recorded_at.isoformat(),
            "status": "success"
        }
        
        # Calculate averages and trends
        if temps:
            response["temperature"] = {
                "current": temps[0],
                "average": round(sum(temps) / len(temps), 1),
                "min": min(temps),
                "max": max(temps),
                "trend": "increasing" if len(temps) > 1 and temps[0] > temps[-1] else "decreasing" if len(temps) > 1 else "stable"
            }
        
        if humidities:
            response["humidity"] = {
                "current": humidities[0],
                "average": round(sum(humidities) / len(humidities), 1),
                "min": min(humidities),
                "max": max(humidities),
                "trend": "increasing" if len(humidities) > 1 and humidities[0] > humidities[-1] else "decreasing" if len(humidities) > 1 else "stable"
            }
        
        if soil_moistures:
            response["soil_moisture"] = {
                "current": soil_moistures[0],
                "average": round(sum(soil_moistures) / len(soil_moistures), 1),
                "min": min(soil_moistures),
                "max": max(soil_moistures),
                "trend": "increasing" if len(soil_moistures) > 1 and soil_moistures[0] > soil_moistures[-1] else "decreasing" if len(soil_moistures) > 1 else "stable"
            }
        
        if water_levels:
            response["water_level"] = {
                "current": water_levels[0],
                "average": round(sum(water_levels) / len(water_levels), 1),
                "min": min(water_levels),
                "max": max(water_levels),
                "trend": "increasing" if len(water_levels) > 1 and water_levels[0] > water_levels[-1] else "decreasing" if len(water_levels) > 1 else "stable"
            }
        
        # Add trend analysis advice
        trend_advice = []
        
        if response.get("temperature", {}).get("trend") == "increasing":
            trend_advice.append("তাপমাত্রা বৃদ্ধি পাচ্ছে। গাছের জন্য ছায়ার ব্যবস্থা করুন।")
        
        if response.get("soil_moisture", {}).get("trend") == "decreasing":
            trend_advice.append("মাটির আর্দ্রতা কমছে। সেচের পরিকল্পনা করুন।")
        
        if response.get("water_level", {}).get("trend") == "decreasing":
            trend_advice.append("পানির স্তর কমছে। পানি সংরক্ষণের ব্যবস্থা নিন।")
        
        if trend_advice:
            response["trend_advice"] = trend_advice
        
        db.close()
        return response
        
    except Exception as e:
        return {
            "error": f"Failed to fetch historical data: {str(e)}",
            "message": "ঐতিহাসিক ডেটা পেতে সমস্যা হয়েছে।"
        }

@tool
def get_sensor_alerts(threshold_temp_high: float = 35, threshold_temp_low: float = 15, 
                     threshold_humidity_high: float = 85, threshold_humidity_low: float = 40,
                     threshold_soil_low: float = 30, threshold_water_low: float = 20) -> Dict[str, Any]:
    """
    Check for sensor alerts based on configurable thresholds.
    
    Args:
        threshold_temp_high: High temperature alert threshold (default: 35°C)
        threshold_temp_low: Low temperature alert threshold (default: 15°C)
        threshold_humidity_high: High humidity alert threshold (default: 85%)
        threshold_humidity_low: Low humidity alert threshold (default: 40%)
        threshold_soil_low: Low soil moisture alert threshold (default: 30%)
        threshold_water_low: Low water level alert threshold (default: 20%)
    
    Returns:
        List of active alerts and recommendations
    """
    try:
        # Get latest sensor data
        latest_result = get_latest_sensor_data()
        
        if "error" in latest_result:
            return latest_result
        
        alerts = []
        
        # Temperature alerts
        if latest_result.get("temperature_c"):
            temp = latest_result["temperature_c"]
            if temp > threshold_temp_high:
                alerts.append({
                    "type": "temperature_high",
                    "severity": "warning",
                    "message": f"তাপমাত্রা অত্যধিক বেশি ({temp}°C)। গাছপালাকে ছায়া দিন।",
                    "value": temp,
                    "threshold": threshold_temp_high
                })
            elif temp < threshold_temp_low:
                alerts.append({
                    "type": "temperature_low", 
                    "severity": "warning",
                    "message": f"তাপমাত্রা খুব কম ({temp}°C)। ঠান্ডার হাত থেকে ফসল রক্ষা করুন।",
                    "value": temp,
                    "threshold": threshold_temp_low
                })
        
        # Humidity alerts
        if latest_result.get("humidity_percent"):
            humidity = latest_result["humidity_percent"]
            if humidity > threshold_humidity_high:
                alerts.append({
                    "type": "humidity_high",
                    "severity": "caution",
                    "message": f"আর্দ্রতা অত্যধিক বেশি ({humidity}%)। ছত্রাক রোগের ঝুঁকি।",
                    "value": humidity,
                    "threshold": threshold_humidity_high
                })
            elif humidity < threshold_humidity_low:
                alerts.append({
                    "type": "humidity_low",
                    "severity": "info",
                    "message": f"আর্দ্রতা কম ({humidity}%)। পানি স্প্রে করুন।",
                    "value": humidity,
                    "threshold": threshold_humidity_low
                })
        
        # Soil moisture alerts
        if latest_result.get("soil_moisture_percent"):
            soil = latest_result["soil_moisture_percent"]
            if soil < threshold_soil_low:
                alerts.append({
                    "type": "soil_moisture_low",
                    "severity": "critical",
                    "message": f"মাটির আর্দ্রতা খুব কম ({soil}%)। জরুরি সেচ দরকার।",
                    "value": soil,
                    "threshold": threshold_soil_low
                })
        
        # Water level alerts
        if latest_result.get("water_level_percent"):
            water = latest_result["water_level_percent"]
            if water < threshold_water_low:
                alerts.append({
                    "type": "water_level_low",
                    "severity": "critical",
                    "message": f"পানির ট্যাংক প্রায় খালি ({water}%)। পানি ভর্তি করুন।",
                    "value": water,
                    "threshold": threshold_water_low
                })
        
        return {
            "alerts": alerts,
            "alert_count": len(alerts),
            "critical_alerts": [a for a in alerts if a["severity"] == "critical"],
            "status": "success",
            "timestamp": latest_result.get("timestamp"),
            "message": "কোনো সতর্কতা নেই। সব স্বাভাবিক আছে।" if not alerts else f"{len(alerts)}টি সতর্কতা পাওয়া গেছে।"
        }
        
    except Exception as e:
        return {
            "error": f"Failed to check alerts: {str(e)}",
            "message": "সতর্কতা পরীক্ষা করতে সমস্যা হয়েছে।"
        }
