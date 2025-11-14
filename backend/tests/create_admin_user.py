"""
Create admin user in regular users table for normal app login
"""
from app.database import SessionLocal
from app.models.user import User, UserPreferences
from app.auth.security import get_password_hash
import uuid

def create_admin_user():
    db = SessionLocal()
    
    try:
        # Check if user exists
        existing = db.query(User).filter(User.email == "admin@krishisahay.com").first()
        
        if existing:
            print("✅ Admin user already exists in users table")
            print(f"   Email: {existing.email}")
            print(f"   ID: {existing.id}")
            return
        
        # Create admin user
        hashed_password = get_password_hash("admin123")
        
        admin_user = User(
            email="admin@krishisahay.com",
            phone="01700000000",
            full_name="Admin User",
            hashed_password=hashed_password,
            division="Dhaka",
            district="Dhaka",
            upazila="Dhaka",
            is_active=1,
            is_verified=1,
            verification_token=str(uuid.uuid4())
        )
        
        db.add(admin_user)
        db.flush()  # Get the ID
        
        # Create default preferences
        preferences = UserPreferences(
            user_id=admin_user.id,
            preferred_language="en",
            voice_enabled=True,
            sms_notifications=True,
            email_notifications=True,
            push_notifications=True,
            weather_alerts=True,
            market_alerts=True,
            crop_alerts=True,
            pest_alerts=True,
            ai_assistance_level="high",
            auto_suggestions=True,
            data_sharing=True
        )
        
        db.add(preferences)
        db.commit()
        
        print("✅ Admin user created in users table!")
        print(f"   Email: admin@krishisahay.com")
        print(f"   Password: admin123")
        print(f"   User ID: {admin_user.id}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Creating Admin User in Users Table")
    print("="*60 + "\n")
    
    create_admin_user()
    
    print("\n" + "="*60)
    print("✅ DONE!")
    print("="*60)
    print("\n📱 You can now login with:")
    print("   Email: admin@krishisahay.com")
    print("   Password: admin123")
    print()
