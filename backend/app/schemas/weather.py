from pydantic import BaseModel, Field
from typing import List, Optional

class Weather(BaseModel):
    id: int
    main: str
    description: str
    icon: str

class MainWeather(BaseModel):
    temp: float
    feels_like: float
    temp_min: float
    temp_max: float
    pressure: int
    humidity: int
    sea_level: Optional[int] = None
    grnd_level: Optional[int] = None

class Wind(BaseModel):
    speed: float
    deg: int
    gust: Optional[float] = None

class Clouds(BaseModel):
    all: int

class Rain(BaseModel):
    three_h: Optional[float] = Field(None, alias='3h')

class Sys(BaseModel):
    pod: str

class CurrentWeatherResponse(BaseModel):
    weather: List[Weather]
    main: MainWeather
    visibility: int
    wind: Wind
    clouds: Clouds
    name: str

class ForecastItem(BaseModel):
    dt: int
    main: MainWeather
    weather: List[Weather]
    clouds: Clouds
    wind: Wind
    visibility: int
    pop: float
    rain: Optional[Rain] = None
    sys: Sys
    dt_txt: str

class City(BaseModel):
    id: int
    name: str
    country: str
    population: int
    timezone: int
    sunrise: int
    sunset: int

class ForecastResponse(BaseModel):
    list: List[ForecastItem]
    city: City

class WeatherAlert(BaseModel):
    sender_name: str
    event: str
    start: int
    end: int
    description: str
    tags: List[str]
