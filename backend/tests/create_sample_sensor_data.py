#!/usr/bin/env python3
"""
Script to create sample sensor data for testing
"""

from datetime import datetime, timedelta
import sqlite3
import random
import uuid

def create_sample_sensor_data():
    conn = sqlite3.connect('krishi_sahay.db')
    cursor = conn.cursor()
    
    try:
        print("Creating sample sensor data...")
        
        # Generate 10 sensor readings over the past 2 hours
        now = datetime.now()
        
        for i in range(10):
            timestamp = now - timedelta(minutes=i * 12)  # Every 12 minutes
            
            # Generate realistic sensor values
            temperature = round(random.uniform(20, 35), 1)  # 20-35°C
            humidity = round(random.uniform(40, 85), 1)     # 40-85%
            soil_moisture = round(random.uniform(30, 70), 1) # 30-70%
            water_level = round(random.uniform(20, 80), 1)   # 20-80%
            
            # Insert sensor data
            cursor.execute("""
                INSERT INTO sensor_data (
                    sensor_config_id, temperature, humidity, soil_moisture, 
                    water_level, soil_ph, light_intensity, battery_level,
                    device_status, data_quality, recorded_at, received_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                1,  # sensor_config_id
                temperature,
                humidity,
                soil_moisture,
                water_level,
                round(random.uniform(6.0, 7.5), 1),  # pH
                round(random.uniform(100, 1000), 1),  # Light level
                round(random.uniform(80, 100), 1),    # Battery level
                'online',
                'good',
                timestamp.isoformat(),
                timestamp.isoformat()
            ))
        
        conn.commit()
        print(f"✅ Created 10 sensor data records")
        
        # Verify data was inserted
        cursor.execute("SELECT COUNT(*) FROM sensor_data")
        count = cursor.fetchone()[0]
        print(f"📊 Total sensor data records: {count}")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating sensor data: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    create_sample_sensor_data()
