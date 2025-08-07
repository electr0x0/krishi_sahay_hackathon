from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models.sensor import SensorConfig
from app.models.user import User
from app.models.farm import Farm
from datetime import datetime

def create_default_sensor_config():
    """Create a default sensor configuration for ESP32 testing"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if default sensor config already exists
        existing_sensor = db.query(SensorConfig).filter(
            SensorConfig.sensor_id == "ESP32_DEFAULT"
        ).first()
        
        if existing_sensor:
            print("Default sensor config already exists")
            return existing_sensor
        
        # Create default user if it doesn't exist
        default_user = db.query(User).filter(User.id == 1).first()
        if not default_user:
            default_user = User(
                id=1,
                username="admin",
                email="admin@krishisahay.com",
                full_name="System Administrator",
                hashed_password="dummy_hash",
                phone_number="0000000000",
                language_preference="bn",
                is_active=True,
                created_at=datetime.now()
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
        
        # Create default farm if it doesn't exist
        default_farm = db.query(Farm).filter(Farm.id == 1).first()
        if not default_farm:
            default_farm = Farm(
                id=1,
                owner_id=1,
                name="Default Farm",
                description="Test farm for sensor data",
                total_area=10.0,
                created_at=datetime.now()
            )
            db.add(default_farm)
            db.commit()
            db.refresh(default_farm)
        
        # Create default sensor config
        default_sensor = SensorConfig(
            id=1,
            user_id=1,
            farm_id=1,
            sensor_id="ESP32_DEFAULT",
            sensor_name="ESP32 Multi-Sensor",
            sensor_type="MULTI",
            location_description="Default ESP32 sensor for testing",
            is_active=True,
            update_interval=300,
            created_at=datetime.now()
        )
        
        db.add(default_sensor)
        db.commit()
        db.refresh(default_sensor)
        
        print(f"Created default sensor config with ID: {default_sensor.id}")
        return default_sensor
        
    except Exception as e:
        print(f"Error creating default sensor config: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    create_default_sensor_config()
