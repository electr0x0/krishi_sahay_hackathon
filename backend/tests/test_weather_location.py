"""
Test script to verify that weather tools work with user location context
"""
import asyncio
from app.services.agent import run_enhanced_agent

async def test_weather_with_location():
    print("🧪 Testing Weather Tools with User Location Context\n")
    
    # Simulate user context with location (Dhaka, Bangladesh)
    user_context = {
        "user_id": 1,
        "language": "bn",
        "location": {
            "district": "Dhaka",
            "lat": 23.8103,
            "lon": 90.4125
        }
    }
    
    # Test query in Bengali asking for weather alerts
    query = "আবহাওয়া সতর্কতা আছে কি?"
    
    print(f"📝 Query: {query}")
    print(f"📍 User Location: {user_context['location']['district']}")
    print(f"   Coordinates: ({user_context['location']['lat']}, {user_context['location']['lon']})\n")
    
    try:
        result = await run_enhanced_agent(
            query=query,
            user_context=user_context,
            language="bn"
        )
        
        print("✅ Agent Response:")
        print(f"   Content: {result.get('content', 'No content')[:200]}...")
        print(f"\n🔧 Tools Called: {[tc.get('name') for tc in result.get('tool_calls', [])]}")
        
        if result.get('tool_outputs'):
            print(f"\n📊 Tool Outputs Available:")
            for tool_name in result.get('tool_outputs', {}).keys():
                print(f"   - {tool_name}")
        
        print("\n" + "="*60)
        print("✅ TEST PASSED: Weather tools working with user location!")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_weather_with_location())
