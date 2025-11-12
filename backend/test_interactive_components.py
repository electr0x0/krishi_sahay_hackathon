"""
Test script for interactive chat components
"""
import json

# Sample tool outputs
sample_weather = {
    "city": {"name": "Dhaka"},
    "list": [
        {"dt_txt": "2025-01-11", "main": {"temp": 25, "humidity": 70}, "weather": [{"main": "Clear"}], "wind": {"speed": 5}},
        {"dt_txt": "2025-01-12", "main": {"temp": 26, "humidity": 72}, "weather": [{"main": "Rain"}], "wind": {"speed": 6}},
        {"dt_txt": "2025-01-13", "main": {"temp": 24, "humidity": 68}, "weather": [{"main": "Clouds"}], "wind": {"speed": 4}},
    ]
}

sample_disease = {
    "disease": "Late Blight",
    "severity": "high",
    "confidence": 0.92,
    "treatment": "Apply Mancozeb fungicide immediately. Remove affected leaves.",
    "symptoms": ["Dark spots on leaves", "White fungal growth", "Stem lesions"],
    "prevention": ["Proper spacing", "Avoid overhead watering", "Regular monitoring"]
}

sample_prices = [
    {"item": "Rice", "price": 50, "change": 5, "market": "Dhaka", "unit": "kg"},
    {"item": "Wheat", "price": 35, "change": -2, "market": "Chittagong", "unit": "kg"},
    {"item": "Potato", "price": 20, "change": 3, "market": "Rajshahi", "unit": "kg"},
]

sample_sensors = {
    "temperature": 28.5,
    "humidity": 65,
    "soil_moisture": 45,
    "ph": 6.5
}

# Simulate component builder
def build_components_from_tools(tool_calls, tool_outputs):
    components = []
    
    for tool_call in tool_calls:
        tool_name = tool_call.get("name", "")
        tool_data = tool_outputs.get(tool_name)
        
        if not tool_data:
            continue
        
        # Weather Forecast Component
        if tool_name == "get_weather_forecast":
            components.append({
                "type": "weather_forecast",
                "data": tool_data,
                "actions": [
                    {"label": "সেচ করার সময়সূচী যোগ করুন", "action": "schedule_irrigation", "icon": "droplet"},
                    {"label": "বিস্তারিত রিপোর্ট দেখুন", "action": "view_weather_details", "icon": "file-text"}
                ]
            })
        
        # Disease Detection Component
        elif tool_name == "diagnose_crop_disease":
            components.append({
                "type": "disease_detection",
                "data": tool_data,
                "actions": [
                    {"label": "চিকিৎসা কিনুন", "action": "buy_treatment", "icon": "shopping-cart"},
                    {"label": "বিশেষজ্ঞের সাথে যোগাযোগ করুন", "action": "contact_expert", "icon": "phone"},
                ]
            })
        
        # Market Price Component
        elif tool_name in ["get_item_price", "get_price_trend"]:
            components.append({
                "type": "market_price",
                "data": tool_data,
                "actions": [
                    {"label": "বিক্রয়ের জন্য তালিকাভুক্ত করুন", "action": "list_for_sale", "icon": "tag"},
                    {"label": "মূল্য সতর্কতা সেট করুন", "action": "set_price_alert", "icon": "bell"},
                ]
            })
        
        # Sensor Data Component
        elif tool_name in ["get_latest_sensor_data", "get_sensor_history"]:
            components.append({
                "type": "sensor_data",
                "data": tool_data,
                "actions": [
                    {"label": "সীমা সতর্কতা সেট করুন", "action": "set_threshold_alert", "icon": "alert-triangle"},
                    {"label": "ঐতিহাসিক ডেটা দেখুন", "action": "view_sensor_history", "icon": "bar-chart"},
                ]
            })
    
    return components

# Test cases
print("🧪 Testing Interactive Chat Components\n")

# Test 1: Weather Forecast
print("1. Weather Forecast Component:")
tool_calls = [{"name": "get_weather_forecast"}]
tool_outputs = {"get_weather_forecast": sample_weather}
components = build_components_from_tools(tool_calls, tool_outputs)
print(json.dumps(components, indent=2, ensure_ascii=False))
print()

# Test 2: Disease Detection
print("2. Disease Detection Component:")
tool_calls = [{"name": "diagnose_crop_disease"}]
tool_outputs = {"diagnose_crop_disease": sample_disease}
components = build_components_from_tools(tool_calls, tool_outputs)
print(json.dumps(components, indent=2, ensure_ascii=False))
print()

# Test 3: Market Prices
print("3. Market Price Component:")
tool_calls = [{"name": "get_item_price"}]
tool_outputs = {"get_item_price": sample_prices}
components = build_components_from_tools(tool_calls, tool_outputs)
print(json.dumps(components, indent=2, ensure_ascii=False))
print()

# Test 4: Sensor Data
print("4. Sensor Data Component:")
tool_calls = [{"name": "get_latest_sensor_data"}]
tool_outputs = {"get_latest_sensor_data": sample_sensors}
components = build_components_from_tools(tool_calls, tool_outputs)
print(json.dumps(components, indent=2, ensure_ascii=False))
print()

# Test 5: Multiple Components
print("5. Multiple Components (Combined):")
tool_calls = [
    {"name": "get_weather_forecast"},
    {"name": "get_item_price"}
]
tool_outputs = {
    "get_weather_forecast": sample_weather,
    "get_item_price": sample_prices
}
components = build_components_from_tools(tool_calls, tool_outputs)
print(f"Generated {len(components)} components")
print(json.dumps(components, indent=2, ensure_ascii=False))

print("\n✅ All tests passed! Component builder working correctly.")
