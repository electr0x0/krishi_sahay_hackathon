from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import DATABASE_URL

# Create SQLite engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},  # SQLite specific
    echo=True if __name__ == "__main__" else False
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all tables"""
    # Import all models here to ensure they are registered with the Base
    from app.models.user import User
    from app.models.chat import ChatSession, ChatMessage
    from app.models.weather import WeatherCache
    from app.models.sensor import SensorConfig, SensorData
    from app.models.farm import Farm
    from app.models.market import MarketPrice
    from app.models.detection import DetectionHistory
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all tables (for development/testing)"""
    Base.metadata.drop_all(bind=engine)
