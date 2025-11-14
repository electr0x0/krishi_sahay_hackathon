"""
Quick test to verify component generation works correctly
"""
import asyncio
import json
from app.services.agent import run_enhanced_agent

async def test_weather_components():
    """Test weather query returns components"""
    
    print("🧪 Testing weather query component generation...\n")
    
    response = await run_enhanced_agent(
        query="আজকের আবহাওয়া কেমন?",
        user_context={
            "user_id": 1,
            "language": "bn",
            "location": {
                "district": "Dhaka",
                "lat": 23.8103,
                "lon": 90.4125
            }
        },
        session_id="test-session-123",
        language="bn"
    )
    
    print(f"✅ Response received!")
    print(f"\n📝 Content: {response.get('content', '')[:200]}...")
    print(f"\n🔧 Tool calls: {len(response.get('tool_calls', []))}")
    print(f"📊 Tool outputs: {list(response.get('tool_outputs', {}).keys())}")
    print(f"\n🎨 Components: {len(response.get('components', []))}")
    
    if response.get('components'):
        print(f"\n📦 Component Details:")
        for i, comp in enumerate(response.get('components', [])):
            print(f"\n  Component {i+1}:")
            print(f"    Type: {comp.get('type')}")
            print(f"    Actions: {len(comp.get('actions', []))}")
            if comp.get('actions'):
                print(f"    Action Labels: {[a.get('label') for a in comp.get('actions', [])[:3]]}")
    else:
        print("\n⚠️ No components generated!")
    
    # Pretty print full response
    print(f"\n📄 Full Response Structure:")
    print(json.dumps({
        "content": response.get('content', '')[:100] + "...",
        "components": response.get('components', []),
        "tool_calls": response.get('tool_calls', []),
        "success": response.get('success')
    }, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(test_weather_components())
