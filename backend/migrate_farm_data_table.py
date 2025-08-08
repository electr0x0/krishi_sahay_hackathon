"""
Migration script to update farm_data table structure
Run this script to update the existing farm_data table to match the new comprehensive farm model
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean, Text, DateTime
from sqlalchemy import create_engine, MetaData, Table
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./krishi_sahay.db")
engine = create_engine(DATABASE_URL)
metadata = MetaData()

def upgrade_farm_data_table():
    """
    Add new columns to the existing farm_data table
    """
    
    # Connect to the database
    connection = engine.connect()
    
    try:
        # Add new columns to the existing table
        # Note: SQLite doesn't support adding multiple columns at once, so we do them one by one
        
        new_columns = [
            "ALTER TABLE farm_data ADD COLUMN farm_name VARCHAR",
            "ALTER TABLE farm_data ADD COLUMN description TEXT",
            "ALTER TABLE farm_data ADD COLUMN farm_type VARCHAR NOT NULL DEFAULT 'crop'",
            "ALTER TABLE farm_data ADD COLUMN division VARCHAR NOT NULL DEFAULT 'Unknown'",
            "ALTER TABLE farm_data ADD COLUMN district VARCHAR NOT NULL DEFAULT 'Unknown'", 
            "ALTER TABLE farm_data ADD COLUMN upazila VARCHAR NOT NULL DEFAULT 'Unknown'",
            "ALTER TABLE farm_data ADD COLUMN union_ward VARCHAR",
            "ALTER TABLE farm_data ADD COLUMN village VARCHAR",
            "ALTER TABLE farm_data ADD COLUMN detailed_address TEXT",
            "ALTER TABLE farm_data ADD COLUMN latitude FLOAT",
            "ALTER TABLE farm_data ADD COLUMN longitude FLOAT",
            "ALTER TABLE farm_data ADD COLUMN elevation FLOAT",
            "ALTER TABLE farm_data ADD COLUMN total_area FLOAT NOT NULL DEFAULT 1.0",
            "ALTER TABLE farm_data ADD COLUMN cultivable_area FLOAT",
            "ALTER TABLE farm_data ADD COLUMN soil_type VARCHAR",
            "ALTER TABLE farm_data ADD COLUMN irrigation_source VARCHAR",
            "ALTER TABLE farm_data ADD COLUMN water_source_distance FLOAT",
            "ALTER TABLE farm_data ADD COLUMN has_electricity BOOLEAN DEFAULT FALSE",
            "ALTER TABLE farm_data ADD COLUMN has_storage BOOLEAN DEFAULT FALSE",
            "ALTER TABLE farm_data ADD COLUMN has_processing_unit BOOLEAN DEFAULT FALSE",
            "ALTER TABLE farm_data ADD COLUMN transportation_access VARCHAR",
            "ALTER TABLE farm_data ADD COLUMN successful_crops INTEGER",
            "ALTER TABLE farm_data ADD COLUMN yearly_production FLOAT",
            "ALTER TABLE farm_data ADD COLUMN current_crops VARCHAR",
            "ALTER TABLE farm_data ADD COLUMN is_active BOOLEAN DEFAULT TRUE",
            "ALTER TABLE farm_data ADD COLUMN is_verified BOOLEAN DEFAULT FALSE",
            "ALTER TABLE farm_data ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE farm_data ADD COLUMN updated_at DATETIME"
        ]
        
        for sql in new_columns:
            try:
                connection.execute(sql)
                print(f"✅ Successfully added column: {sql.split('ADD COLUMN')[1].split()[0]}")
            except Exception as e:
                if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                    print(f"⚠️  Column already exists: {sql.split('ADD COLUMN')[1].split()[0]}")
                else:
                    print(f"❌ Error adding column: {e}")
        
        # Update existing records to have default values
        update_queries = [
            "UPDATE farm_data SET farm_name = farmer_name || ' খামার' WHERE farm_name IS NULL",
            "UPDATE farm_data SET farm_type = 'crop' WHERE farm_type IS NULL",
            "UPDATE farm_data SET division = 'Unknown' WHERE division IS NULL",
            "UPDATE farm_data SET district = COALESCE(location, 'Unknown') WHERE district IS NULL",
            "UPDATE farm_data SET upazila = 'Unknown' WHERE upazila IS NULL",
            "UPDATE farm_data SET is_active = TRUE WHERE is_active IS NULL",
            "UPDATE farm_data SET is_verified = FALSE WHERE is_verified IS NULL",
            "UPDATE farm_data SET successful_crops = successful_result WHERE successful_crops IS NULL AND successful_result IS NOT NULL"
        ]
        
        for query in update_queries:
            try:
                connection.execute(query)
                print(f"✅ Updated existing data: {query[:50]}...")
            except Exception as e:
                print(f"❌ Error updating data: {e}")
        
        print("🎉 Farm data table migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        
    finally:
        connection.close()

if __name__ == "__main__":
    print("🚀 Starting farm_data table migration...")
    upgrade_farm_data_table()
    print("✅ Migration completed!")
