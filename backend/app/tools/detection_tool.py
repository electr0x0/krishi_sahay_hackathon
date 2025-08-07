from langchain_core.tools import tool
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from app.database import get_db
from app.models.detection import DetectionHistory
from app.models.user import User

from langchain_core.tools import tool
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from app.database import get_db
from app.models.detection import DetectionHistory
from app.models.user import User

@tool
def get_user_detection_history(limit: int = 5) -> str:
    """
    Get the latest detection history for the current user to help AI provide context-aware advice.
    
    This tool retrieves the most recent plant disease detection results for the current user,
    which helps the AI agent provide personalized recommendations based on their
    recent crop health observations. The user_id is automatically obtained from the current session.
    
    Args:
        limit: Maximum number of recent detections to retrieve (default: 5, max: 10)
        
    Returns:
        JSON string containing detection history with disease information, confidence levels,
        and timestamps. Returns empty list if no detections found.
        
    Example usage:
        - When user asks about their recent plant health issues
        - To provide personalized disease management advice
        - To track disease patterns over time
    """
    
    # Note: In a real LangGraph agent, the user_id would be extracted from the agent state
    # For now, we'll use a placeholder approach
    # TODO: Extract user_id from agent state in the actual implementation
    
    # Validate limit
    if limit > 10:
        limit = 10
    if limit < 1:
        limit = 1
    
    try:
        # Get database session
        db = next(get_db())
        
        # For now, return a message that explains the tool functionality
        # In production, this would extract user_id from the agent context
        return json.dumps({
            "status": "info",
            "message": "এই টুলটি বর্তমান ব্যবহারকারীর সাম্প্রতিক রোগ শনাক্তকরণের ইতিহাস প্রদান করে।",
            "message_en": "This tool provides recent disease detection history for the current user.",
            "note": "Agent integration required to access current user context",
            "requested_limit": limit
        }, ensure_ascii=False, indent=2)
        
    except Exception as e:
        error_result = {
            "status": "error",
            "message": f"ডেটা লোড করতে সমস্যা হয়েছে: {str(e)}",
            "message_en": f"Error loading detection history: {str(e)}",
            "history": []
        }
        return json.dumps(error_result, ensure_ascii=False, indent=2)
    
    finally:
        db.close()

def _get_user_detection_history_impl(user_id: int, limit: int = 5) -> str:
    """
    Internal implementation to get detection history for a specific user.
    This will be called by the agent with the current user's ID.
    """
    
    # Validate limit
    if limit > 10:
        limit = 10
    if limit < 1:
        limit = 1
    
    try:
        # Get database session
        db = next(get_db())
        
        # Query recent detection history for the user
        detection_history = db.query(DetectionHistory).filter(
            DetectionHistory.user_id == user_id,
            DetectionHistory.success == True
        ).order_by(
            DetectionHistory.created_at.desc()
        ).limit(limit).all()
        
        if not detection_history:
            return json.dumps({
                "status": "success",
                "message": "ব্যবহারকারীর কোনো সাম্প্রতিক শনাক্তকরণের ইতিহাস পাওয়া যায়নি।",
                "message_en": "No recent detection history found for user.",
                "history": []
            }, ensure_ascii=False, indent=2)
        
        # Format the detection history for AI consumption
        formatted_history = []
        
        for detection in detection_history:
            detection_data = {
                "id": detection.id,
                "date": detection.created_at.strftime("%Y-%m-%d"),
                "time": detection.created_at.strftime("%H:%M:%S"),
                "detection_count": detection.detection_count,
                "processing_time": detection.processing_time,
                "confidence_threshold": detection.confidence_threshold,
                "diseases_found": []
            }
            
            # Extract disease information from detections JSON
            if detection.detections:
                for det in detection.detections:
                    disease_info = {
                        "disease_name_bengali": det.get("class_name", ""),
                        "original_class": det.get("original_class", ""),
                        "confidence": round(det.get("confidence", 0), 2),
                        "severity": det.get("severity", ""),
                        "severity_level": _get_severity_level(det.get("severity", ""))
                    }
                    detection_data["diseases_found"].append(disease_info)
            
            formatted_history.append(detection_data)
        
        result = {
            "status": "success", 
            "user_id": user_id,
            "total_detections": len(formatted_history),
            "message": f"ব্যবহারকারীর সাম্প্রতিক {len(formatted_history)}টি রোগ শনাক্তকরণের ইতিহাস পাওয়া গেছে।",
            "message_en": f"Found {len(formatted_history)} recent disease detections for user.",
            "history": formatted_history,
            "summary": _generate_detection_summary(formatted_history)
        }
        
        return json.dumps(result, ensure_ascii=False, indent=2)
        
    except Exception as e:
        error_result = {
            "status": "error",
            "message": f"ডেটা লোড করতে সমস্যা হয়েছে: {str(e)}",
            "message_en": f"Error loading detection history: {str(e)}",
            "history": []
        }
        return json.dumps(error_result, ensure_ascii=False, indent=2)
    
    finally:
        db.close()

def _get_severity_level(severity: str) -> int:
    """Convert severity text to numeric level for AI processing."""
    severity_map = {
        "গুরুতর": 4, "severe": 4,
        "মাঝারি": 3, "moderate": 3,  
        "হালকা": 2, "mild": 2,
        "কম": 1, "low": 1
    }
    return severity_map.get(severity.lower(), 1)

def _generate_detection_summary(history: List[Dict]) -> Dict[str, Any]:
    """Generate a summary of detection patterns for AI analysis."""
    if not history:
        return {}
    
    total_diseases = sum(len(h["diseases_found"]) for h in history)
    
    # Count disease types
    disease_counts = {}
    severity_counts = {"গুরুতর": 0, "মাঝারি": 0, "হালকা": 0, "কম": 0}
    
    for detection in history:
        for disease in detection["diseases_found"]:
            disease_name = disease["original_class"]
            disease_counts[disease_name] = disease_counts.get(disease_name, 0) + 1
            
            severity = disease["severity"]
            if severity in severity_counts:
                severity_counts[severity] += 1
    
    # Find most common diseases
    most_common_diseases = sorted(disease_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    
    return {
        "total_detections": len(history),
        "total_diseases_found": total_diseases,
        "average_diseases_per_scan": round(total_diseases / len(history), 1),
        "most_common_diseases": most_common_diseases,
        "severity_distribution": severity_counts,
        "recent_scan_date": history[0]["date"] if history else None,
        "needs_attention": severity_counts["গুরুতর"] > 0 or severity_counts["মাঝারি"] > 2
    }

@tool  
def get_detection_insights() -> str:
    """
    Analyze current user's detection history to provide insights and recommendations.
    
    This tool analyzes patterns in the user's plant disease detection history
    to identify trends, recurring problems, and provide actionable insights.
    The user_id is automatically obtained from the current session.
        
    Returns:
        JSON string containing analysis insights, trends, and recommendations
        based on detection history patterns.
        
    Example usage:
        - To provide personalized crop management advice
        - To identify recurring disease problems
        - To suggest preventive measures based on history
    """
    
    try:
        # For now, return a message that explains the tool functionality
        # In production, this would extract user_id from the agent context
        return json.dumps({
            "status": "info",
            "message": "এই টুলটি ব্যবহারকারীর রোগ শনাক্তকরণের প্যাটার্ন বিশ্লেষণ করে এবং ব্যক্তিগত সুপারিশ প্রদান করে।",
            "message_en": "This tool analyzes user's disease detection patterns and provides personalized recommendations.",
            "note": "Agent integration required to access current user context"
        }, ensure_ascii=False, indent=2)
        
    except Exception as e:
        error_result = {
            "status": "error", 
            "message": f"বিশ্লেষণ করতে সমস্যা হয়েছে: {str(e)}",
            "message_en": f"Error analyzing detection history: {str(e)}",
            "insights": []
        }
        return json.dumps(error_result, ensure_ascii=False, indent=2)

def _get_detection_insights_impl(user_id: int) -> str:
    """
    Internal implementation to analyze detection history for a specific user.
    This will be called by the agent with the current user's ID.
    """
    
    try:
        # Get database session
        db = next(get_db())
        
        # Get all detection history for pattern analysis
        all_detections = db.query(DetectionHistory).filter(
            DetectionHistory.user_id == user_id,
            DetectionHistory.success == True
        ).order_by(
            DetectionHistory.created_at.desc()
        ).limit(20).all()  # Analyze up to 20 recent detections
        
        if not all_detections:
            return json.dumps({
                "status": "no_data",
                "message": "বিশ্লেষণের জন্য পর্যাপ্ত ডেটা নেই।",
                "message_en": "Insufficient data for analysis.",
                "insights": []
            }, ensure_ascii=False, indent=2)
        
        insights = _analyze_detection_patterns(all_detections)
        
        result = {
            "status": "success",
            "user_id": user_id,
            "analysis_period": f"গত {len(all_detections)}টি শনাক্তকরণ",
            "analysis_period_en": f"Last {len(all_detections)} detections",
            "insights": insights
        }
        
        return json.dumps(result, ensure_ascii=False, indent=2)
        
    except Exception as e:
        error_result = {
            "status": "error", 
            "message": f"বিশ্লেষণ করতে সমস্যা হয়েছে: {str(e)}",
            "message_en": f"Error analyzing detection history: {str(e)}",
            "insights": []
        }
        return json.dumps(error_result, ensure_ascii=False, indent=2)
    
    finally:
        db.close()

def _analyze_detection_patterns(detections: List[DetectionHistory]) -> List[Dict[str, Any]]:
    """Analyze detection patterns to generate insights."""
    insights = []
    
    # Collect all diseases across detections
    all_diseases = []
    severe_diseases = []
    
    for detection in detections:
        if detection.detections:
            for disease in detection.detections:
                all_diseases.append({
                    "name": disease.get("original_class", ""),
                    "bengali_name": disease.get("class_name", ""),
                    "severity": disease.get("severity", ""),
                    "confidence": disease.get("confidence", 0),
                    "date": detection.created_at
                })
                
                if disease.get("severity") in ["গুরুতর", "severe"]:
                    severe_diseases.append(disease)
    
    # Insight 1: Most frequent diseases
    disease_frequency = {}
    for disease in all_diseases:
        name = disease["name"]
        disease_frequency[name] = disease_frequency.get(name, 0) + 1
    
    if disease_frequency:
        most_common = max(disease_frequency.items(), key=lambda x: x[1])
        if most_common[1] > 1:
            insights.append({
                "type": "recurring_disease",
                "priority": "high" if most_common[1] > 3 else "medium",
                "title": "পুনরাবৃত্ত রোগ সমস্যা",
                "title_en": "Recurring Disease Problem",
                "message": f"আপনার ফসলে '{most_common[0]}' রোগটি {most_common[1]} বার পাওয়া গেছে। এটি একটি পুনরাবৃত্ত সমস্যা।",
                "recommendation": "নিয়মিত প্রতিরোধমূলক ব্যবস্থা নিন এবং বিশেষজ্ঞের পরামর্শ নিন।"
            })
    
    # Insight 2: Severe disease warning
    if severe_diseases:
        insights.append({
            "type": "severe_disease_alert",
            "priority": "urgent",
            "title": "গুরুতর রোগের সতর্কতা",
            "title_en": "Severe Disease Alert", 
            "message": f"আপনার সাম্প্রতিক স্ক্যানে {len(severe_diseases)}টি গুরুতর রোগ পাওয়া গেছে।",
            "recommendation": "অবিলম্বে চিকিৎসা শুরু করুন এবং কৃষি বিশেষজ্ঞের সাথে যোগাযোগ করুন।"
        })
    
    # Insight 3: Detection frequency
    detection_count = len(detections)
    if detection_count > 5:
        insights.append({
            "type": "monitoring_pattern",
            "priority": "low",
            "title": "নিয়মিত পর্যবেক্ষণ",
            "title_en": "Regular Monitoring",
            "message": f"আপনি নিয়মিত ফসল পর্যবেক্ষণ করছেন ({detection_count}টি স্ক্যান)। এটি একটি ভালো অভ্যাস।",
            "recommendation": "এই নিয়মিত পর্যবেক্ষণ চালিয়ে যান এবং প্রাথমিক পর্যায়ে রোগ শনাক্ত করুন।"
        })
    
    return insights
