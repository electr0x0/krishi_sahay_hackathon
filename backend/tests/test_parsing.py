import json

# Test the parsing logic with the actual response
test_response = """```json
{
  "irrigation": {
    "recommended": false,
    "reason": "বৃষ্টির সম্ভাবনা এবং বাতাসে আর্দ্রতা বেশি থাকায় এখন সেচ দেওয়ার প্রয়োজন নেই।",
    "reasonEn": "No irrigation is needed now due to the possibility of rain and high humidity in the air."
  },
  "spraying": {
    "suitable": false,
    "reason": "বাতাসের গতি বেশি (৫.২৯ মি/সেকেন্ড) এবং বৃষ্টির পূর্বাভাস থাকায় স্প্রে করা ঠিক হবে না। এতে স্প্রে ধুয়ে যেতে পারে বা কার্যকর নাও হতে পারে।",
    "reasonEn": "Spraying is not suitable due to high wind speed (5.29 m/s) and rain forecast. The spray might wash away or be ineffective."
  },
  "harvesting": {
    "suitable": false,
    "reason": "বৃষ্টির পূর্বাভাস থাকায় ফসল কাটা এখন উপযুক্ত নয়। এতে কাটা ফসলের মান খারাপ হতে পারে বা পচন ধরতে পারে।",
    "reasonEn": "Harvesting is not suitable now due to the rain forecast. It may degrade the quality of harvested crops or cause spoilage."
  },
  "planting": {
    "suitable": true,
    "reason": "হালকা বৃষ্টির সম্ভাবনা থাকায় এবং তাপমাত্রা অনুকূল থাকায় চারা রোপণ বা বীজ বপনের জন্য এটি একটি ভালো সময়, যদি জমিতে অতিরিক্ত পানি জমে না থাকে।",
    "reasonEn": "With the possibility of light rain and favorable temperatures, it's a good time for planting seedlings or sowing seeds, provided there is no excessive waterlogging in the field."
  },
  "field_work": {
    "suitable": false,
    "reason": "মাঝে মাঝে হালকা বৃষ্টির পূর্বাভাস থাকায় এবং মাটি ভেজা থাকার কারণে ভারী মাঠের কাজ যেমন জমি তৈরি বা নিড়ানি দেওয়া কষ্টকর হতে পারে।",
    "reasonEn": "Heavy field work like land preparation or weeding might be difficult due to intermittent light rain forecast and wet soil."
  },
  "fertilizer_application": {
    "recommended": true,
    "reason": "হালকা বৃষ্টির সম্ভাবনা থাকায় সার প্রয়োগ করা যেতে পারে, কারণ বৃষ্টি সারকে মাটির সাথে মিশতে সাহায্য করবে। তবে বেশি বৃষ্টি হলে সার ধুয়ে যেতে পারে।",
    "reasonEn": "Fertilizer application can be done due to the possibility of light rain, as rain will help mix the fertilizer with the soil. However, heavy rain might wash away the fertilizer."
  }
}
```"""

def parse_ai_response(content_text):
    try:
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
            return recommendations
        else:
            # Try parsing the whole cleaned content
            recommendations = json.loads(content_text.strip())
            return recommendations
            
    except Exception as e:
        print(f"Error parsing: {e}")
        return None

# Test the parsing
result = parse_ai_response(test_response)
print("Parsed result:")
print(json.dumps(result, indent=2, ensure_ascii=False))

if result:
    print("\nParsing successful!")
    for activity, advice in result.items():
        print(f"{activity}: {advice.get('recommended', advice.get('suitable', 'N/A'))}")
else:
    print("Parsing failed!")
