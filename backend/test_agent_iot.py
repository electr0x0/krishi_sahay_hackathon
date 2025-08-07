"""
Test the AI agent with IoT sensor tools
"""
import requests
import json

def test_agent_with_iot():
    print("🤖 Testing AI Agent with IoT Sensor Tools")
    print("=" * 60)
    
    # Backend URL
    base_url = "http://localhost:8000"
    
    # Test queries
    test_queries = [
        "আমার ক্ষেতের বর্তমান অবস্থা কেমন? সেন্সর ডেটা দেখে বলুন।",
        "মাটির আর্দ্রতা কেমন আছে?",
        "কোন সতর্কতা আছে কিনা চেক করুন।",
        "গত ২৪ ঘন্টার ট্রেন্ড দেখে পরামর্শ দিন।",
        "তাপমাত্রা এবং আর্দ্রতার অবস্থা কেমন?"
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n🔍 Test {i}: {query}")
        print("-" * 50)
        
        try:
            # Make request to agent
            response = requests.post(
                f"{base_url}/api/agent/invoke",
                json={"query": query},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                agent_response = result.get("result", "No response")
                print(f"🤖 Agent Response:\n{agent_response}")
            else:
                print(f"❌ Request failed: {response.status_code} - {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Connection error: {e}")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
        
        print("\n" + "="*60)
    
    print("🎉 Agent testing completed!")

if __name__ == "__main__":
    test_agent_with_iot()
