from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn
import os

from app.core.config import APP_NAME, APP_VERSION, DEBUG, ALLOWED_ORIGINS
from app.database import create_tables
from app.api import agent, auth, chat, iot, market, tts, user, weather

# Create FastAPI app
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Smart Agriculture Platform API with AI assistance, IoT integration, and farmer management",
    debug=DEBUG
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create upload directories
os.makedirs("uploads/images", exist_ok=True)
os.makedirs("uploads/documents", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(agent.router, prefix="/api/agent", tags=["AI Agent"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(iot.router, prefix="/api/iot", tags=["IoT Sensors"])
app.include_router(market.router, prefix="/api", tags=["Market"])
app.include_router(tts.router, prefix="/api", tags=["Text-to-Speech"])
app.include_router(user.router, prefix="/api", tags=["Users"])
app.include_router(weather.router, prefix="/api", tags=["Weather"])

@app.on_event("startup")
async def startup_event():
    """Initialize database and other startup tasks"""
    try:
        create_tables()
        print(f"✅ {APP_NAME} v{APP_VERSION} started successfully!")
        print(f"🗄️  Database initialized")
        print(f"🔗 API available at: http://localhost:8000")
        print(f"📚 API docs at: http://localhost:8000/docs")
    except Exception as e:
        print(f"❌ Startup failed: {e}")
        raise

@app.get("/")
async def read_root():
    """Root endpoint with API information"""
    return {
        "message": f"{APP_NAME} is running!",
        "version": APP_VERSION,
        "status": "healthy",
        "features": [
            "JWT Authentication",
            "AI Agricultural Assistant",
            "IoT Sensor Integration", 
            "Chat with Context",
            "Bengali/English Support",
            "Bengali Text-to-Speech (gTTS)",
            "Market Price Data",
            "Weather Information",
            "Crop Management"
        ],
        "endpoints": {
            "authentication": "/api/auth",
            "ai_agent": "/api/agent", 
            "chat": "/api/chat",
            "iot_sensors": "/api/iot",
            "text_to_speech": "/api/tts",
            "documentation": "/docs",
            "openapi": "/openapi.json"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "version": APP_VERSION,
        "database": "connected",
        "ai_service": "available",
        "iot_service": "available",
        "tts_service": "available"
    }

@app.get("/api")
async def api_info():
    """API information and available endpoints"""
    return {
        "app_name": APP_NAME,
        "version": APP_VERSION,
        "description": "Smart Agriculture Platform API",
        "contact": {
            "name": "Krishi Sahay Team",
            "email": "support@krishisahay.com"
        },
        "available_services": {
            "authentication": {
                "description": "User registration, login, and JWT token management",
                "endpoints": ["/api/auth/register", "/api/auth/login", "/api/auth/me"]
            },
            "ai_agent": {
                "description": "AI-powered agricultural assistant with Bengali support",
                "endpoints": ["/api/agent/invoke", "/api/agent/chat"]
            },
            "chat": {
                "description": "Context-aware chat sessions with voice support",
                "endpoints": ["/api/chat/sessions", "/api/chat/sessions/{id}/messages"]
            },
            "iot_sensors": {
                "description": "IoT sensor data management for DHT22, GY-30, soil moisture",
                "endpoints": ["/api/iot/sensors", "/api/iot/sensors/{id}/data"]
            }
        }
    }

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "message": "The requested endpoint does not exist",
            "available_endpoints": "/docs for complete API documentation"
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "support": "Please contact support if this persists"
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG,
        log_level="info" if not DEBUG else "debug"
    )
