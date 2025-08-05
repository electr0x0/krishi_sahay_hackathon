import httpx
from datetime import datetime
from langchain_core.tools import tool
from typing import Dict, Any, Optional, List

from app.core.config import OPENWEATHER_API_KEY

OPENWEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5"

def get_coordinates(location: str) -> Optional[Dict[str, float]]:
    """Get coordinates for a location using OpenWeatherMap Geocoding API."""
    if not OPENWEATHER_API_KEY:
        raise ValueError("OPENWEATHER_API_KEY is not set.")
    
    geocode_url = f"http://api.openweathermap.org/geo/1.0/direct"
    params = {"q": f"{location},BD", "limit": 1, "appid": OPENWEATHER_API_KEY}
    try:
        with httpx.Client() as client:
            response = client.get(geocode_url, params=params)
            response.raise_for_status()
            data = response.json()
            if data:
                return {"lat": data[0]["lat"], "lon": data[0]["lon"]}
    except (httpx.RequestError, IndexError, KeyError) as e:
        print(f"Error getting coordinates for {location}: {e}")
    return None

@tool
def get_current_weather(location: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
    """Get current weather information for a specific location or coordinates."""
    if not (lat and lon) and location:
        coords = get_coordinates(location)
        if not coords:
            return {"error": f"Could not find coordinates for {location}."}
        lat, lon = coords["lat"], coords["lon"]

    params = {"lat": lat, "lon": lon, "appid": OPENWEATHER_API_KEY, "units": "metric", "lang": "bn"}
    try:
        with httpx.Client() as client:
            response = client.get(f"{OPENWEATHER_BASE_URL}/weather", params=params)
            response.raise_for_status()
            return response.json()
    except httpx.RequestError as e:
        return {"error": f"Failed to fetch current weather: {e}"}

@tool
def get_weather_forecast(location: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None, days: int = 5) -> Dict[str, Any]:
    """Get a 5-day weather forecast for a specific location or coordinates."""
    if not (lat and lon) and location:
        coords = get_coordinates(location)
        if not coords:
            return {"error": f"Could not find coordinates for {location}."}
        lat, lon = coords["lat"], coords["lon"]

    params = {"lat": lat, "lon": lon, "appid": OPENWEATHER_API_KEY, "units": "metric", "lang": "bn", "cnt": days * 8}
    try:
        with httpx.Client() as client:
            response = client.get(f"{OPENWEATHER_BASE_URL}/forecast", params=params)
            response.raise_for_status()
            return response.json()
    except httpx.RequestError as e:
        return {"error": f"Failed to fetch weather forecast: {e}"}

@tool
def get_weather_alerts(location: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> List[Dict[str, Any]]:
    """Generates weather alerts based on the 5-day forecast for a specific location or coordinates."""
    forecast_data = get_weather_forecast.invoke({"location": location, "lat": lat, "lon": lon, "days": 5})
    if "error" in forecast_data:
        return [{"error": forecast_data["error"]}]
    
    alerts = []
    # ... (alert generation logic)
    return alerts
