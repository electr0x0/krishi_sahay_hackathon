from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.tools.weather_tool import get_current_weather, get_weather_forecast, get_weather_alerts
from app.models.user import User
from app.models.weather import WeatherCache
from app.schemas.weather import CurrentWeatherResponse, ForecastResponse, WeatherAlert

router = APIRouter()

CACHE_DURATION = timedelta(hours=1)

@router.get("/weather/current", response_model=CurrentWeatherResponse)
def get_current_weather_data(
    location: Optional[str] = Query(None, description="City or district name in Bangladesh"),
    force_refresh: bool = Query(False, description="Force a refresh from the API"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    lat, lon = current_user.latitude, current_user.longitude
    
    # Use user's location if available, otherwise use provided location, fallback to Dhaka
    if not location:
        if hasattr(current_user, 'district') and current_user.district:
            location = current_user.district
        else:
            location = "Dhaka"  # Default fallback location
    
    loc_key = f"{lat},{lon}" if lat and lon else location

    cached = db.query(WeatherCache).filter(WeatherCache.location == loc_key).first()
    if cached and cached.current_data and not force_refresh and (datetime.utcnow() - cached.last_updated) < CACHE_DURATION:
        return json.loads(cached.current_data)

    result = get_current_weather.invoke({"location": location, "lat": lat, "lon": lon})
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    if cached:
        cached.current_data = json.dumps(result)
        cached.last_updated = datetime.utcnow()
    else:
        cached = WeatherCache(location=loc_key, current_data=json.dumps(result))
        db.add(cached)
    db.commit()
    return result

@router.get("/weather/forecast", response_model=ForecastResponse)
def get_weather_forecast_data(
    location: Optional[str] = Query(None, description="City or district name in Bangladesh"),
    days: int = Query(5, ge=1, le=5),
    force_refresh: bool = Query(False, description="Force a refresh from the API"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    lat, lon = current_user.latitude, current_user.longitude
    
    # Use user's location if available, otherwise use provided location, fallback to Dhaka
    if not location:
        if hasattr(current_user, 'district') and current_user.district:
            location = current_user.district
        else:
            location = "Dhaka"  # Default fallback location
    
    loc_key = f"{lat},{lon}" if lat and lon else location

    cached = db.query(WeatherCache).filter(WeatherCache.location == loc_key).first()
    if cached and cached.forecast_data and not force_refresh and (datetime.utcnow() - cached.last_updated) < CACHE_DURATION:
        return json.loads(cached.forecast_data)

    result = get_weather_forecast.invoke({"location": location, "lat": lat, "lon": lon, "days": days})
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    
    if cached:
        cached.forecast_data = json.dumps(result)
        cached.last_updated = datetime.utcnow()
    else:
        cached = WeatherCache(location=loc_key, forecast_data=json.dumps(result))
        db.add(cached)
    db.commit()
    return result

@router.get("/weather/alerts", response_model=List[WeatherAlert])
def get_weather_alerts_data(
    location: Optional[str] = Query(None, description="City or district name in Bangladesh"),
    current_user: User = Depends(get_current_active_user)
):
    lat, lon = current_user.latitude, current_user.longitude
    
    # Use user's location if available, otherwise use provided location, fallback to Dhaka
    if not location:
        if hasattr(current_user, 'district') and current_user.district:
            location = current_user.district
        else:
            location = "Dhaka"  # Default fallback location

    result = get_weather_alerts.invoke({"location": location, "lat": lat, "lon": lon})
    if result and "error" in result[0]:
        raise HTTPException(status_code=404, detail=result[0]["error"])
    return result
