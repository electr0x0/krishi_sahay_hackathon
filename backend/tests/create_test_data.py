import sqlite3
from datetime import datetime

# Direct database insertion for testing
def create_test_data():
    """Insert test data directly into the database"""
    try:
        # Connect to the database
        conn = sqlite3.connect('krishi_sahay.db')
        cursor = conn.cursor()
        
        # Check if sensor_data table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sensor_data'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("❌ sensor_data table does not exist")
            return
        
        # Insert some test data
        test_data = [
            (1, 25.5, 65.2, 75.0, 450, datetime.now(), datetime.now(), 'online', 'good'),
            (1, 26.2, 63.8, 72.0, 465, datetime.now(), datetime.now(), 'online', 'good'),
            (1, 24.8, 67.1, 78.0, 442, datetime.now(), datetime.now(), 'online', 'good'),
            (1, 27.1, 61.5, 70.0, 478, datetime.now(), datetime.now(), 'online', 'good'),
            (1, 25.9, 64.7, 76.0, 451, datetime.now(), datetime.now(), 'online', 'good'),
        ]
        
        for data in test_data:
            cursor.execute("""
                INSERT INTO sensor_data 
                (sensor_config_id, temperature, humidity, water_level, 
                 soil_moisture, recorded_at, received_at, device_status, data_quality)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, data)
        
        conn.commit()
        print(f"✅ Inserted {len(test_data)} test records")
        
        # Check the data
        cursor.execute("SELECT COUNT(*) FROM sensor_data")
        count = cursor.fetchone()[0]
        print(f"📊 Total records in database: {count}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_test_data()
