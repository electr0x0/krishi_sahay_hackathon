import json
from datetime import datetime, timedelta
from langchain_core.tools import tool
from typing import Dict, Any, List

@tool
def diagnose_crop_disease(crop_name: str, symptoms: str, image_description: str = "") -> str:
    """
    Diagnose crop diseases based on symptoms and provide treatment recommendations.
    
    Args:
        crop_name: Name of the crop (in Bengali or English)
        symptoms: Description of symptoms observed
        image_description: Description of uploaded image (if any)
        
    Returns:
        Disease diagnosis and treatment recommendations
    """
    
    # Disease database for common crops
    disease_database = {
        "ধান": {
            "পাতা হলুদ হওয়া": {
                "disease": "ব্লাস্ট রোগ",
                "treatment": "ট্রাইসাইক্লাজল ২ গ্রাম প্রতি লিটার পানিতে মিশিয়ে স্প্রে করুন",
                "prevention": "বীজ শোধন করুন, জমিতে পানি জমতে দেবেন না"
            },
            "পাতায় বাদামি দাগ": {
                "disease": "ব্রাউন স্পট",
                "treatment": "কার্বেন্ডাজিম ০.১% স্প্রে করুন",
                "prevention": "সুষম সার প্রয়োগ করুন"
            }
        },
        "টমেটো": {
            "পাতা কুঁকড়ানো": {
                "disease": "লিফ কার্ল ভাইরাস",
                "treatment": "আক্রান্ত গাছ তুলে ফেলুন, ইমিডাক্লোপ্রিড স্প্রে করুন",
                "prevention": "সাদা মাছি নিয়ন্ত্রণ করুন"
            },
            "ফলে কালো দাগ": {
                "disease": "ব্লাইট রোগ",
                "treatment": "কপার অক্সিক্লোরাইড স্প্রে করুন",
                "prevention": "অতিরিক্ত পানি এড়িয়ে চলুন"
            }
        }
    }
    
    # Simple symptom matching
    crop_diseases = disease_database.get(crop_name, {})
    
    best_match = None
    for symptom_key, disease_info in crop_diseases.items():
        if symptom_key in symptoms:
            best_match = disease_info
            break
    
    if best_match:
        result = f"🔍 {crop_name} এর রোগ নির্ণয়:\n\n"
        result += f"🦠 সম্ভাব্য রোগ: {best_match['disease']}\n\n"
        result += f"💊 চিকিৎসা:\n{best_match['treatment']}\n\n"
        result += f"🛡️ প্রতিরোধ:\n{best_match['prevention']}\n\n"
        result += "⚠️ সতর্কতা: গুরুতর অবস্থায় স্থানীয় কৃষি অফিসারের সাহায্য নিন।"
    else:
        result = f"🔍 {crop_name} এর জন্য নির্দিষ্ট রোগ নির্ণয় করতে পারিনি।\n\n"
        result += "💡 সাধারণ পরামর্শ:\n"
        result += "• আক্রান্ত অংশ কেটে ফেলুন\n"
        result += "• বোর্দো মিশ্রণ স্প্রে করুন\n"
        result += "• জমিতে নিষ্কাশনের ব্যবস্থা করুন\n"
        result += "• স্থানীয় কৃষি বিশেষজ্ঞের পরামর্শ নিন"
    
    return result

@tool
def get_crop_calendar(crop_name: str, season: str = "বর্তমান") -> str:
    """
    Get crop calendar with planting, care, and harvesting schedules.
    
    Args:
        crop_name: Name of the crop
        season: Growing season (রবি, খরিফ, বর্তমান)
        
    Returns:
        Detailed crop calendar and care instructions
    """
    
    crop_calendars = {
        "ধান": {
            "আউশ": {
                "বীজতলা": "চৈত্র-বৈশাখ (মার্চ-এপ্রিল)",
                "রোপণ": "জ্যৈষ্ঠ-আষাঢ় (মে-জুন)",
                "পরিচর্যা": "আষাঢ়-ভাদ্র (জুন-আগস্ট)",
                "ফসল কাটা": "ভাদ্র-আশ্বিন (আগস্ট-সেপ্টেম্বর)"
            },
            "আমন": {
                "বীজতলা": "আষাঢ়-শ্রাবণ (জুন-জুলাই)",
                "রোপণ": "শ্রাবণ-ভাদ্র (জুলাই-আগস্ট)",
                "পরিচর্যা": "ভাদ্র-কার্তিক (আগস্ট-নভেম্বর)",
                "ফসল কাটা": "অগ্রহায়ণ-পৌষ (নভেম্বর-ডিসেম্বর)"
            }
        },
        "গম": {
            "রবি": {
                "বপন": "কার্তিক-অগ্রহায়ণ (অক্টোবর-নভেম্বর)",
                "সার প্রয়োগ": "পৌষ-মাঘ (ডিসেম্বর-জানুয়ারি)",
                "সেচ": "মাঘ-ফাল্গুন (জানুয়ারি-ফেব্রুয়ারি)",
                "ফসল কাটা": "চৈত্র-বৈশাখ (মার্চ-এপ্রিল)"
            }
        }
    }
    
    crop_info = crop_calendars.get(crop_name, {})
    
    if crop_info:
        result = f"📅 {crop_name} এর চাষাবাদ ক্যালেন্ডার:\n\n"
        
        for season_name, activities in crop_info.items():
            result += f"🌾 {season_name} মৌসুম:\n"
            for activity, timing in activities.items():
                result += f"• {activity}: {timing}\n"
            result += "\n"
        
        # Add general care instructions
        result += "🧑‍🌾 সাধারণ পরিচর্যা:\n"
        result += "• নিয়মিত আগাছা পরিষ্কার করুন\n"
        result += "• সময়মতো সার ও কীটনাশক প্রয়োগ করুন\n"
        result += "• সেচ ও নিষ্কাশনের ব্যবস্থা রাখুন\n"
        result += "• পোকামাকড় ও রোগবালাই পর্যবেক্ষণ করুন"
    else:
        result = f"দুঃখিত, {crop_name} এর জন্য নির্দিষ্ট ক্যালেন্ডার পাওয়া যায়নি।\n\n"
        result += "💡 সাধারণ নির্দেশনা:\n"
        result += "• স্থানীয় কৃষি অফিসে যোগাযোগ করুন\n"
        result += "• অভিজ্ঞ কৃষকদের পরামর্শ নিন\n"
        result += "• মাটি ও আবহাওয়া অনুযায়ী পরিকল্পনা করুন"
    
    return result

@tool
def get_fertilizer_recommendation(crop_name: str, soil_type: str, growth_stage: str) -> str:
    """
    Get fertilizer recommendations based on crop, soil type, and growth stage.
    
    Args:
        crop_name: Name of the crop
        soil_type: Type of soil (এঁটেল, দোআঁশ, বালি)
        growth_stage: Current growth stage (চারা, কুশি, ফুল, ফল)
        
    Returns:
        Detailed fertilizer recommendations with quantities
    """
    
    fertilizer_recommendations = {
        "ধান": {
            "চারা": {
                "ইউরিয়া": "৫০ কেজি/একর প্রথম কিস্তি",
                "টিএসপি": "৫০ কেজি/একর (বপনের সময়)",
                "এমওপি": "২৫ কেজি/একর প্রথম কিস্তি",
                "পরামর্শ": "জমিতে পানি থাকা অবস্থায় সার দিন"
            },
            "কুশি": {
                "ইউরিয়া": "৫০ কেজি/একর দ্বিতীয় কিস্তি",
                "এমওপি": "২৫ কেজি/একর দ্বিতীয় কিস্তি",
                "পরামর্শ": "কুশি আসার ১৫-২০ দিন পর সার দিন"
            },
            "ফুল": {
                "ইউরিয়া": "৩০ কেজি/একর তৃতীয় কিস্তি",
                "পটাশ": "১৫ কেজি/একর অতিরিক্ত",
                "পরামর্শ": "ফুল আসার আগে সার প্রয়োগ করুন"
            }
        },
        "টমেটো": {
            "চারা": {
                "ইউরিয়া": "৩০ কেজি/একর",
                "টিএসপি": "৮০ কেজি/একর",
                "এমওপি": "৪০ কেজি/একর",
                "পরামর্শ": "চারা রোপণের ১০ দিন পর সার দিন"
            },
            "ফুল": {
                "ইউরিয়া": "২০ কেজি/একর",
                "ক্যালসিয়াম": "১০ কেজি/একর",
                "বোরন": "০.৫ কেজি/একর",
                "পরামর্শ": "ফুল আসার সময় ক্যালসিয়াম গুরুত্বপূর্ণ"
            }
        }
    }
    
    crop_fertilizers = fertilizer_recommendations.get(crop_name, {})
    stage_fertilizers = crop_fertilizers.get(growth_stage, {})
    
    if stage_fertilizers:
        result = f"🌱 {crop_name} এর {growth_stage} অবস্থায় সার প্রয়োগ:\n\n"
        
        for fertilizer, amount in stage_fertilizers.items():
            if fertilizer != "পরামর্শ":
                result += f"• {fertilizer}: {amount}\n"
        
        if "পরামর্শ" in stage_fertilizers:
            result += f"\n💡 বিশেষ পরামর্শ: {stage_fertilizers['পরামর্শ']}\n"
        
        # Soil-specific adjustments
        result += f"\n🌍 {soil_type} মাটির জন্য:\n"
        if soil_type == "এঁটেল":
            result += "• ইউরিয়া কিছু কম দিন, জৈব সার বেশি দিন\n"
        elif soil_type == "বালি":
            result += "• ইউরিয়া কিছু বেশি দিন, ঘন ঘন প্রয়োগ করুন\n"
        elif soil_type == "দোআঁশ":
            result += "• স্ট্যান্ডার্ড মাত্রায় সার প্রয়োগ করুন\n"
        
        result += "\n⚠️ সতর্কতা: সার প্রয়োগের আগে মাটি পরীক্ষা করান।"
    else:
        result = f"দুঃখিত, {crop_name} এর {growth_stage} অবস্থার জন্য নির্দিষ্ট সার সুপারিশ পাওয়া যায়নি।\n\n"
        result += "💡 সাধারণ পরামর্শ:\n"
        result += "• স্থানীয় কৃষি অফিসে যোগাযোগ করুন\n"
        result += "• মাটি পরীক্ষা করান\n"
        result += "• জৈব সার ব্যবহার করুন"
    
    return result