import json

# Simulate exactly what happens in our API
def test_weather_recommendations_logic():
    # Simulate the AI response (exactly what we get from agent service)
    ai_response = {
        "content": "```json\n{\n  \"irrigation\": {\n    \"recommended\": false,\n    \"reason\": \"বৃষ্টির সম্ভাবনা এবং বাতাসে আর্দ্রতা বেশি থাকায় এখন সেচ দেওয়ার প্রয়োজন নেই।\",\n    \"reasonEn\": \"No irrigation is needed now due to the possibility of rain and high humidity in the air.\"\n  },\n  \"spraying\": {\n    \"suitable\": false,\n    \"reason\": \"বাতাসের গতি বেশি (৫.২৯ মি/সেকেন্ড) এবং বৃষ্টির পূর্বাভাস থাকায় স্প্রে করা ঠিক হবে না। এতে স্প্রে ধুয়ে যেতে পারে বা কার্যকর নাও হতে পারে।\",\n    \"reasonEn\": \"Spraying is not suitable due to high wind speed (5.29 m/s) and rain forecast. The spray might wash away or be ineffective.\"\n  },\n  \"harvesting\": {\n    \"suitable\": false,\n    \"reason\": \"বৃষ্টির পূর্বাভাস থাকায় ফসল কাটা এখন উপযুক্ত নয়। এতে কাটা ফসলের মান খারাপ হতে পারে বা পচন ধরতে পারে।\",\n    \"reasonEn\": \"Harvesting is not suitable now due to the rain forecast. It may degrade the quality of harvested crops or cause spoilage.\"\n  },\n  \"planting\": {\n    \"suitable\": true,\n    \"reason\": \"হালকা বৃষ্টির সম্ভাবনা থাকায় এবং তাপমাত্রা অনুকূল থাকায় চারা রোপণ বা বীজ বপনের জন্য এটি একটি ভালো সময়, যদি জমিতে অতিরিক্ত পানি জমে না থাকে।\",\n    \"reasonEn\": \"With the possibility of light rain and favorable temperatures, it's a good time for planting seedlings or sowing seeds, provided there is no excessive waterlogging in the field.\"\n  },\n  \"field_work\": {\n    \"suitable\": false,\n    \"reason\": \"মাঝে মাঝে হালকা বৃষ্টির পূর্বাভাস থাকায় এবং মাটি ভেজা থাকার কারণে ভারী মাঠের কাজ যেমন জমি তৈরি বা নিড়ানি দেওয়া কষ্টকর হতে পারে।\",\n    \"reasonEn\": \"Heavy field work like land preparation or weeding might be difficult due to intermittent light rain forecast and wet soil.\"\n  },\n  \"fertilizer_application\": {\n    \"recommended\": true,\n    \"reason\": \"হালকা বৃষ্টির সম্ভাবনা থাকায় সার প্রয়োগ করা যেতে পারে, কারণ বৃষ্টি সারকে মাটির সাথে মিশতে সাহায্য করবে। তবে বেশি বৃষ্টি হলে সার ধুয়ে যেতে পারে।\",\n    \"reasonEn\": \"Fertilizer application can be done due to the possibility of light rain, as rain will help mix the fertilizer with the soil. However, heavy rain might wash away the fertilizer.\"\n  }\n}\n```",
        "session_id": "test-123",
        "success": True
    }

    # Simulate our parsing logic from weather_recommendations.py
    recommendations = {}
    try:
        # Try to parse the AI response content
        ai_content = ai_response.get('content', '')
        
        # Handle the content based on its type
        if isinstance(ai_content, list):
            # If it's a list, take the first item
            content_text = ai_content[0] if ai_content else ''
        else:
            # If it's already a string, use it directly  
            content_text = str(ai_content)
            
        print(f"Content to parse: {content_text[:100]}...")  # Debug log
            
        # Remove markdown code blocks if present
        if "```json" in content_text:
            start = content_text.find("```json") + 7
            end = content_text.rfind("```")
            if end > start:
                content_text = content_text[start:end].strip()
        elif "```" in content_text:
            start = content_text.find("```") + 3
            end = content_text.rfind("```")
            if end > start:
                content_text = content_text[start:end].strip()
        
        # Find JSON object boundaries
        start_brace = content_text.find('{')
        end_brace = content_text.rfind('}')
        
        if start_brace != -1 and end_brace != -1 and end_brace > start_brace:
            json_text = content_text[start_brace:end_brace + 1]
            recommendations = json.loads(json_text)
            print(f"Successfully parsed recommendations: {list(recommendations.keys())}")  # Debug log
        else:
            # Try parsing the whole cleaned content
            recommendations = json.loads(content_text.strip())
            print(f"Successfully parsed full content: {list(recommendations.keys())}")  # Debug log
            
    except (json.JSONDecodeError, TypeError, IndexError, AttributeError) as e:
        print(f"Failed to parse AI response as JSON: {e}")
        recommendations = {"error": "parsing failed"}

    # Test return object structure
    response_obj = {
        "success": True,
        "ai_recommendations": recommendations,  # This should be a dict, not a string
        "raw_ai_response": ai_response,
    }

    print(f"\nFinal ai_recommendations type: {type(response_obj['ai_recommendations'])}")
    print(f"Final ai_recommendations content: {list(response_obj['ai_recommendations'].keys()) if isinstance(response_obj['ai_recommendations'], dict) else 'Not a dict'}")
    
    return response_obj

# Run the test
result = test_weather_recommendations_logic()
