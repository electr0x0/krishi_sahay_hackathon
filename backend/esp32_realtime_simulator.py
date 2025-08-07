import requests
import json
from datetime import datetime
import time
import random
import math

class ESP32Simulator:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.endpoint = f"{base_url}/api/iot/sensor-data/"
        self.running = False
        
        # Simulation state
        self.last_temp = 25.0
        self.last_humidity = 65.0
        self.last_soil = 70.0
        self.last_water = 80.0
    
    def generate_realistic_data(self):
        """Generate realistic sensor data with gradual changes"""
        # Temperature: gradual changes with some noise
        temp_change = random.uniform(-0.5, 0.5)
        self.last_temp = max(15, min(40, self.last_temp + temp_change))
        
        # Humidity: inverse relationship with temperature + noise
        humidity_change = -temp_change * 0.8 + random.uniform(-2, 2)
        self.last_humidity = max(30, min(95, self.last_humidity + humidity_change))
        
        # Soil moisture: slow changes
        soil_change = random.uniform(-0.3, 0.3)
        self.last_soil = max(20, min(90, self.last_soil + soil_change))
        
        # Water level: gradual decrease with occasional refills
        if random.random() < 0.02:  # 2% chance of refill
            water_change = random.uniform(10, 20)
        else:
            water_change = random.uniform(-0.1, 0.1)
        
        self.last_water = max(10, min(100, self.last_water + water_change))
        
        # Calculate heat index (simplified)
        heat_index = self.last_temp + (self.last_humidity - 40) * 0.1
        
        return {
            "timestamp": datetime.now().isoformat() + "Z",
            "temperature_c": round(self.last_temp, 1),
            "humidity_percent": round(self.last_humidity, 1),
            "heat_index_c": round(heat_index, 1),
            "water_level_raw": int(self.last_water * 10),  # Convert to raw sensor reading
            "water_level_percent": int(self.last_water),
            "soil_moisture_raw": int(self.last_soil * 10),  # Convert to raw sensor reading
            "soil_moisture_percent": int(self.last_soil)
        }
    
    def send_data(self, data):
        """Send sensor data to the backend"""
        try:
            response = requests.post(self.endpoint, json=data, timeout=5)
            
            if response.status_code == 200:
                result = response.json()
                return True, result
            else:
                return False, f"HTTP {response.status_code}: {response.text}"
                
        except requests.exceptions.RequestException as e:
            return False, f"Connection error: {e}"
    
    def start_simulation(self, interval=5):
        """Start continuous sensor data simulation"""
        print("🚀 ESP32 Sensor Simulator Started!")
        print(f"📡 Sending data every {interval} seconds")
        print(f"🎯 Target URL: {self.endpoint}")
        print("=" * 60)
        
        self.running = True
        reading_count = 0
        
        try:
            while self.running:
                reading_count += 1
                
                # Generate and send data
                data = self.generate_realistic_data()
                success, result = self.send_data(data)
                
                # Display status
                timestamp = datetime.now().strftime("%H:%M:%S")
                
                if success:
                    print(f"✅ [{timestamp}] Reading #{reading_count} sent successfully")
                    print(f"   🌡️  Temp: {data['temperature_c']}°C  💧 Humidity: {data['humidity_percent']}%")
                    print(f"   🌱 Soil: {data['soil_moisture_percent']}%  💧 Water: {data['water_level_percent']}%")
                else:
                    print(f"❌ [{timestamp}] Reading #{reading_count} failed: {result}")
                
                print("-" * 60)
                
                # Wait for next reading
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n⏹️  Simulation stopped by user")
        except Exception as e:
            print(f"\n❌ Simulation error: {e}")
        finally:
            self.running = False
            print(f"\n📊 Total readings sent: {reading_count}")
            print("🎉 ESP32 Simulation ended")
    
    def test_connection(self):
        """Test if the backend is reachable"""
        try:
            health_url = f"{self.base_url}/health"
            response = requests.get(health_url, timeout=5)
            return response.status_code == 200
        except:
            return False

def main():
    simulator = ESP32Simulator()
    
    # Test connection first
    print("🔍 Testing backend connection...")
    if simulator.test_connection():
        print("✅ Backend is reachable!")
        
        # Send a single test reading
        print("\n🧪 Sending test reading...")
        test_data = simulator.generate_realistic_data()
        success, result = simulator.send_data(test_data)
        
        if success:
            print("✅ Test reading successful!")
            print(f"💾 Data stored with ID: {result.get('id', 'Unknown')}")
            
            # Start continuous simulation
            print("\n🔄 Starting continuous simulation...")
            print("📝 Note: Press Ctrl+C to stop the simulation")
            input("Press Enter to start, or Ctrl+C to exit...")
            
            simulator.start_simulation(interval=5)  # Send data every 5 seconds
        else:
            print(f"❌ Test reading failed: {result}")
    else:
        print("❌ Cannot reach backend. Please ensure it's running on http://localhost:8000")

if __name__ == "__main__":
    main()
