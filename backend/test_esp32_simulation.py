import requests
import json
from datetime import datetime
import time
import random

# ESP32 data simulation script
def generate_sensor_data():
    """Generate realistic sensor data"""
    return {
        "timestamp": datetime.now().isoformat() + "Z",
        "temperature_c": round(random.uniform(20, 35), 1),
        "humidity_percent": round(random.uniform(40, 80), 1),
        "heat_index_c": round(random.uniform(22, 38), 1),
        "water_level_raw": random.randint(100, 800),
        "water_level_percent": round(random.uniform(20, 90), 0),
        "soil_moisture_raw": random.randint(200, 900),
        "soil_moisture_percent": round(random.uniform(30, 85), 0)
    }

def send_sensor_data():
    """Send sensor data to the backend"""
    url = "http://localhost:8000/api/iot/sensor-data/"
    
    try:
        data = generate_sensor_data()
        response = requests.post(url, json=data)
        
        if response.status_code == 200:
            print(f"✅ Data sent successfully: {data}")
            return response.json()
        else:
            print(f"❌ Failed to send data: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        return None

def simulate_continuous_data(interval=10, count=50):
    """Simulate continuous sensor data transmission"""
    print(f"🚀 Starting ESP32 sensor simulation...")
    print(f"📡 Sending {count} readings every {interval} seconds")
    print("=" * 50)
    
    for i in range(count):
        print(f"\n📊 Reading {i+1}/{count}")
        result = send_sensor_data()
        
        if result:
            print(f"💾 Stored with ID: {result.get('id', 'Unknown')}")
        
        if i < count - 1:  # Don't wait after the last reading
            print(f"⏳ Waiting {interval} seconds...")
            time.sleep(interval)
    
    print("\n🎉 Simulation completed!")

if __name__ == "__main__":
    # Test single data submission first
    print("🧪 Testing single data submission...")
    result = send_sensor_data()
    
    if result:
        print("\n✅ Single test successful! Starting continuous simulation...")
        simulate_continuous_data(interval=5, count=10)  # Send 10 readings every 5 seconds
    else:
        print("\n❌ Single test failed. Please check if the backend is running.")
