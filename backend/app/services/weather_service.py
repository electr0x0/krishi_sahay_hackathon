import httpx
import asyncio
from typing import Optional, Dict, Any
from app.core.config import OPENWEATHER_API_KEY

class WeatherService:
    def __init__(self):
        self.api_key = OPENWEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"
    
    async def get_location_data(self, lat: float, lon: float) -> Optional[Dict[Any, Any]]:
        """Get weather and location data from OpenWeather API"""
        if not self.api_key:
            return None
            
        try:
            async with httpx.AsyncClient() as client:
                # Get current weather data which includes some location info
                weather_url = f"{self.base_url}/weather"
                params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": self.api_key,
                    "units": "metric"
                }
                
                response = await client.get(weather_url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    
                    # Extract relevant data
                    location_data = {
                        "elevation": data.get("main", {}).get("sea_level"),  # Sea level pressure can indicate elevation
                        "country": data.get("sys", {}).get("country"),
                        "timezone": data.get("timezone"),
                        "weather_condition": data.get("weather", [{}])[0].get("main"),
                        "temperature": data.get("main", {}).get("temp"),
                        "humidity": data.get("main", {}).get("humidity"),
                        "pressure": data.get("main", {}).get("pressure"),
                        "sea_level_pressure": data.get("main", {}).get("sea_level"),
                        "ground_level_pressure": data.get("main", {}).get("grnd_level")
                    }
                    
                    return location_data
                else:
                    print(f"OpenWeather API error: {response.status_code}")
                    return None
                    
        except Exception as e:
            print(f"Error fetching weather data: {e}")
            return None
    
    async def calculate_elevation_from_pressure(self, pressure: float, sea_level_pressure: float) -> Optional[float]:
        """Calculate approximate elevation from pressure readings"""
        if not pressure or not sea_level_pressure:
            return None
            
        try:
            # Barometric formula approximation
            # Elevation (m) = 44330 * (1 - (P/P0)^(1/5.255))
            # Where P0 is sea level pressure and P is local pressure
            elevation = 44330 * (1 - pow(pressure / sea_level_pressure, 1/5.255))
            return round(elevation, 2)
        except:
            return None

# Create singleton instance
weather_service = WeatherService()
