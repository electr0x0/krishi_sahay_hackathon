"""
Simple migration to handle the new comprehensive farm data structure
"""

from sqlalchemy import text
from app.database import get_db, engine

def upgrade_farm_data():
    """
    Add new columns to existing farm_data table using text-based SQL
    """
    db = next(get_db())
    
    # List of new columns to add
    columns_to_add = [
        ("farm_name", "TEXT"),
        ("description", "TEXT"),
        ("farm_type", "TEXT DEFAULT 'crop'"),
        ("division", "TEXT DEFAULT 'Unknown'"),
        ("district_new", "TEXT DEFAULT 'Unknown'"),  # Different name to avoid conflict
        ("upazila", "TEXT DEFAULT 'Unknown'"),
        ("union_ward", "TEXT"),
        ("village", "TEXT"),
        ("detailed_address", "TEXT"),
        ("latitude", "REAL"),
        ("longitude", "REAL"),
        ("elevation", "REAL"),
        ("total_area", "REAL DEFAULT 1.0"),
        ("cultivable_area", "REAL"),
        ("soil_type", "TEXT"),
        ("irrigation_source", "TEXT"),
        ("water_source_distance", "REAL"),
        ("has_electricity", "BOOLEAN DEFAULT 0"),
        ("has_storage", "BOOLEAN DEFAULT 0"),
        ("has_processing_unit", "BOOLEAN DEFAULT 0"),
        ("transportation_access", "TEXT"),
        ("successful_crops", "INTEGER"),
        ("yearly_production", "REAL"),
        ("current_crops", "TEXT"),
        ("is_active", "BOOLEAN DEFAULT 1"),
        ("is_verified", "BOOLEAN DEFAULT 0"),
        ("created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
        ("updated_at", "DATETIME")
    ]
    
    for column_name, column_type in columns_to_add:
        try:
            sql = text(f"ALTER TABLE farm_data ADD COLUMN {column_name} {column_type}")
            db.execute(sql)
            db.commit()
            print(f"✅ Added column: {column_name}")
        except Exception as e:
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                print(f"⚠️  Column {column_name} already exists")
            else:
                print(f"❌ Error adding {column_name}: {e}")
    
    # Update existing records
    try:
        update_sql = text("""
            UPDATE farm_data 
            SET 
                farm_name = COALESCE(farm_name, farmer_name || ' খামার'),
                farm_type = COALESCE(farm_type, 'crop'),
                division = COALESCE(division, 'Unknown'),
                district_new = COALESCE(district_new, location, 'Unknown'),
                upazila = COALESCE(upazila, 'Unknown'),
                is_active = COALESCE(is_active, 1),
                is_verified = COALESCE(is_verified, 0),
                successful_crops = COALESCE(successful_crops, successful_result),
                total_area = COALESCE(total_area, 1.0)
            WHERE farmer_name IS NOT NULL
        """)
        db.execute(update_sql)
        db.commit()
        print("✅ Updated existing records")
    except Exception as e:
        print(f"❌ Error updating records: {e}")
    
    db.close()
    print("🎉 Migration completed!")

if __name__ == "__main__":
    print("🚀 Starting farm data migration...")
    upgrade_farm_data()
    print("✅ Done!")
