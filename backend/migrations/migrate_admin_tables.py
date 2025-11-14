"""
Migration script to add admin tables to the database
Run this script to create admin_users, activity_logs, support_tickets, and moderation_queue tables
"""

from app.database import engine, Base
from app.models.admin import AdminUser, ActivityLog, SupportTicket, ModerationQueue
from app.auth.security import get_password_hash
from sqlalchemy.orm import Session
from datetime import datetime


def create_admin_tables():
    """Create all admin-related tables"""
    print("📊 Creating admin tables...")
    
    try:
        # Create tables
        Base.metadata.create_all(bind=engine, tables=[
            AdminUser.__table__,
            ActivityLog.__table__,
            SupportTicket.__table__,
            ModerationQueue.__table__,
        ])
        print("✅ Admin tables created successfully!")
        return True
    except Exception as e:
        print(f"❌ Error creating admin tables: {e}")
        return False


def create_default_admin():
    """Create a default super admin user"""
    print("\n👤 Creating default admin user...")
    
    try:
        from sqlalchemy import text
        import hashlib
        
        with Session(engine) as session:
            # Check if admin already exists using raw SQL to avoid relationship issues
            result = session.execute(
                text("SELECT id FROM admin_users WHERE email = :email"),
                {"email": "admin@krishisahay.com"}
            ).first()
            
            if result:
                print("ℹ️  Default admin user already exists")
                return True
            
            # Use SHA256 for now (simpler, will work for demo)
            password = "admin123"
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            # Create super admin using raw SQL
            session.execute(
                text("""
                    INSERT INTO admin_users (email, password_hash, full_name, role, is_active, created_at)
                    VALUES (:email, :password_hash, :full_name, :role, :is_active, :created_at)
                """),
                {
                    "email": "admin@krishisahay.com",
                    "password_hash": password_hash,
                    "full_name": "System Administrator",
                    "role": "super_admin",
                    "is_active": 1,
                    "created_at": datetime.utcnow()
                }
            )
            
            session.commit()
            
            print("✅ Default admin user created successfully!")
            print("\n" + "="*60)
            print("🔐 DEFAULT ADMIN CREDENTIALS:")
            print("   Email: admin@krishisahay.com")
            print("   Password: admin123")
            print("   Role: super_admin")
            print("="*60)
            print("\n⚠️  IMPORTANT: Change the default password immediately!")
            print("ℹ️  Note: Using SHA256 hash for demo. Update to bcrypt in production!")
            
            return True
    except Exception as e:
        print(f"❌ Error creating default admin: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run the migration"""
    print("\n" + "="*60)
    print("🚀 ADMIN DASHBOARD MIGRATION")
    print("="*60 + "\n")
    
    # Step 1: Create tables
    if not create_admin_tables():
        print("\n❌ Migration failed at table creation")
        return
    
    # Step 2: Create default admin
    if not create_default_admin():
        print("\n❌ Migration failed at admin creation")
        return
    
    print("\n" + "="*60)
    print("✅ MIGRATION COMPLETED SUCCESSFULLY!")
    print("="*60)
    print("\n📱 Next Steps:")
    print("   1. Start the backend server: uvicorn main:app --reload")
    print("   2. Access admin dashboard at: http://localhost:3000/admin")
    print("   3. Login with the default credentials above")
    print("   4. Change the default admin password immediately!")
    print("\n")


if __name__ == "__main__":
    main()
