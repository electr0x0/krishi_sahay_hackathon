"""
Add heat_index column to sensor_data table
"""

import os
import sys
from sqlalchemy import create_engine, Column, Float, text

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import Base
from app.core.config import DATABASE_URL as SQLALCHEMY_DATABASE_URL

def add_heat_index_column():
    """Add heat_index column to sensor_data table"""
    print("🔧 Adding heat_index column to sensor_data table...")
    
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    try:
        # For SQLite
        if "sqlite" in SQLALCHEMY_DATABASE_URL:
            with engine.connect() as conn:
                # Check if column already exists
                result = conn.execute(text("PRAGMA table_info(sensor_data)"))
                columns = [row[1] for row in result]
                
                if "heat_index" not in columns:
                    conn.execute(text("ALTER TABLE sensor_data ADD COLUMN heat_index FLOAT"))
                    conn.commit()
                    print("✅ Added heat_index column to sensor_data table")
                else:
                    print("ℹ️  heat_index column already exists")
        
        # For PostgreSQL
        else:
            with engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE sensor_data 
                    ADD COLUMN IF NOT EXISTS heat_index FLOAT
                """))
                conn.commit()
                print("✅ Added heat_index column to sensor_data table")
        
        # Calculate and update heat_index for existing records
        print("🔄 Calculating heat_index for existing records...")
        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE sensor_data 
                SET heat_index = temperature + (0.348 * humidity) - 4.25
                WHERE temperature IS NOT NULL 
                  AND humidity IS NOT NULL 
                  AND heat_index IS NULL
            """))
            conn.commit()
            print("✅ Updated heat_index for existing records")
        
        print("🎉 Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        raise

if __name__ == "__main__":
    add_heat_index_column()

