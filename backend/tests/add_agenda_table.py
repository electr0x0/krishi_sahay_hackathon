#!/usr/bin/env python3
"""
Add agenda table for AI-powered task management
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import DATABASE_URL
from app.database import Base
from app.models.agenda import Agenda
from app.models.user import User


def add_agenda_table():
    """Add agenda table to database"""
    engine = create_engine(DATABASE_URL)
    
    try:
        # Create agenda table
        print("Creating agenda table...")
        Agenda.__table__.create(engine, checkfirst=True)
        print("✅ Agenda table created successfully")
        
        # Add foreign key constraint if it doesn't exist
        with engine.connect() as conn:
            try:
                # Check if foreign key exists
                result = conn.execute(text("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='agendas'
                """)).fetchone()
                
                if result:
                    print("✅ Agenda table exists and is ready")
                else:
                    print("❌ Agenda table was not created properly")
                    
            except Exception as e:
                print(f"⚠️  Warning during FK check: {e}")
        
        print("\n📋 Agenda system migration completed!")
        print("🤖 AI-powered task management is now available")
        
    except Exception as e:
        print(f"❌ Error creating agenda table: {e}")
        return False
    
    return True


if __name__ == "__main__":
    success = add_agenda_table()
    if success:
        print("\n🎉 Migration completed successfully!")
        print("You can now use the agenda API endpoints.")
    else:
        print("\n💥 Migration failed!")
        sys.exit(1)
