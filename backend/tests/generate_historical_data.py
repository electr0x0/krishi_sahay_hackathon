import sqlite3
from datetime import datetime, timedelta
import random
import math

def generate_historical_data(days=7, readings_per_day=288):
    """Generate realistic historical sensor data"""
    conn = sqlite3.connect('krishi_sahay.db')
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute("DELETE FROM sensor_data")
    
    # Generate data for the last N days
    base_time = datetime.now() - timedelta(days=days)
    
    total_readings = 0
    
    for day in range(days):
        current_date = base_time + timedelta(days=day)
        
        for reading in range(readings_per_day):
            # Calculate time for this reading (every 5 minutes)
            timestamp = current_date + timedelta(minutes=reading * 5)
            
            # Create realistic daily patterns
            hour = timestamp.hour
            minute = timestamp.minute
            
            # Temperature: cooler at night, warmer during day
            base_temp = 22 + 8 * math.sin((hour - 6) * math.pi / 12)
            temperature = base_temp + random.uniform(-2, 2)
            temperature = max(15, min(40, temperature))  # Realistic bounds
            
            # Humidity: inverse relationship with temperature + random variation
            base_humidity = 85 - (temperature - 20) * 1.5
            humidity = base_humidity + random.uniform(-10, 10)
            humidity = max(30, min(95, humidity))  # Realistic bounds
            
            # Soil moisture: varies slowly, with some daily patterns
            soil_base = 60 + 10 * math.sin((day * 2 + hour / 24) * math.pi)
            soil_moisture = soil_base + random.uniform(-5, 5)
            soil_moisture = max(20, min(90, soil_moisture))
            
            # Water level: decreases slowly over time, with refill events
            water_base = 80 - (day * 2) + (20 if random.random() < 0.05 else 0)  # 5% chance of refill
            water_level = water_base + random.uniform(-3, 3)
            water_level = max(10, min(100, water_level))
            
            # Insert the data
            cursor.execute("""
                INSERT INTO sensor_data 
                (sensor_config_id, temperature, humidity, water_level, soil_moisture, 
                 recorded_at, received_at, device_status, data_quality)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                1,  # sensor_config_id
                round(temperature, 1),
                round(humidity, 1),
                round(water_level, 1),
                round(soil_moisture, 1),
                timestamp,
                timestamp + timedelta(seconds=random.randint(1, 30)),  # Small delay for received_at
                'online' if random.random() > 0.02 else 'offline',  # 2% chance of offline
                'good' if random.random() > 0.05 else 'warning'  # 5% chance of warning
            ))
            
            total_readings += 1
            
            # Progress indicator
            if total_readings % 100 == 0:
                print(f"📊 Generated {total_readings} readings...")
    
    conn.commit()
    conn.close()
    
    print(f"✅ Generated {total_readings} historical sensor readings over {days} days")
    print(f"📈 Data spans from {base_time.strftime('%Y-%m-%d %H:%M')} to {datetime.now().strftime('%Y-%m-%d %H:%M')}")

if __name__ == "__main__":
    print("🚀 Generating realistic historical sensor data...")
    generate_historical_data(days=3, readings_per_day=288)  # 3 days, reading every 5 minutes
    print("🎉 Historical data generation complete!")
