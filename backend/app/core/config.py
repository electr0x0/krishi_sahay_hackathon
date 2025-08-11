import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

# API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPEN_WEATHER_API")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./krishi_sahay.db")

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

# App Settings
APP_NAME = "Krishi Sahay - Smart Agriculture Platform"
APP_VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# CORS Settings
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:5174",
    "https://krishi-sahay-hackathon.vercel.app/",
    "http://krishi-sahay-hackathon.vercel.app",
    "https://krishi-sahay-hackathon.vercel.app"
]

# Validation
if not GOOGLE_API_KEY:
    raise ValueError("Missing GOOGLE_API_KEY environment variable")

# File Upload Settings
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"]

# IoT Settings
IOT_UPDATE_INTERVAL = 300  # 5 minutes
SENSOR_TIMEOUT = 30  # seconds
