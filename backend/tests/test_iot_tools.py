"""
Test script for IoT sensor tools
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.tools.iot_sensor_tool import get_latest_sensor_data, get_sensor_history, get_sensor_alerts

def test_iot_tools():
    print("🧪 Testing IoT Sensor Tools")
    print("=" * 50)
    
    # Test 1: Get latest sensor data
    print("\n📊 Test 1: Getting latest sensor data...")
    try:
        latest_data = get_latest_sensor_data.invoke({})
        print("✅ Latest Data Tool Result:")
        print(f"   Status: {latest_data.get('status', 'unknown')}")
        if 'temperature_c' in latest_data:
            print(f"   Temperature: {latest_data['temperature_c']}°C")
            print(f"   Humidity: {latest_data['humidity_percent']}%")
            print(f"   Soil Moisture: {latest_data['soil_moisture_percent']}%")
            print(f"   Water Level: {latest_data['water_level_percent']}%")
        if 'farming_advice' in latest_data:
            print(f"   Advice: {len(latest_data['farming_advice'])} suggestions")
        if 'error' in latest_data:
            print(f"   Error: {latest_data['error']}")
    except Exception as e:
        print(f"❌ Error testing latest data: {e}")
    
    # Test 2: Get sensor history
    print("\n📈 Test 2: Getting sensor history...")
    try:
        history_data = get_sensor_history.invoke({"hours": 24, "limit": 10})
        print("✅ History Tool Result:")
        print(f"   Status: {history_data.get('status', 'unknown')}")
        print(f"   Total readings: {history_data.get('total_readings', 0)}")
        if 'temperature' in history_data:
            temp_data = history_data['temperature']
            print(f"   Temperature - Current: {temp_data['current']}°C, Avg: {temp_data['average']}°C, Trend: {temp_data['trend']}")
        if 'error' in history_data:
            print(f"   Error: {history_data['error']}")
    except Exception as e:
        print(f"❌ Error testing history: {e}")
    
    # Test 3: Get sensor alerts
    print("\n🚨 Test 3: Checking sensor alerts...")
    try:
        alerts_data = get_sensor_alerts.invoke({})
        print("✅ Alerts Tool Result:")
        print(f"   Status: {alerts_data.get('status', 'unknown')}")
        print(f"   Alert count: {alerts_data.get('alert_count', 0)}")
        if alerts_data.get('alerts'):
            for alert in alerts_data['alerts']:
                print(f"   Alert: {alert['type']} - {alert['severity']} - {alert['message']}")
        else:
            print("   No alerts detected")
        if 'error' in alerts_data:
            print(f"   Error: {alerts_data['error']}")
    except Exception as e:
        print(f"❌ Error testing alerts: {e}")
    
    print("\n🎉 IoT sensor tools test completed!")

if __name__ == "__main__":
    test_iot_tools()
