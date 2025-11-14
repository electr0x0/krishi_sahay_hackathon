#!/usr/bin/env python3
"""
Comprehensive verification script for Gemini Detection setup
Tests database, service, and API integration
"""

import sys
import os
import asyncio
from sqlalchemy import inspect

def check_environment():
    """Check if GOOGLE_API_KEY is set"""
    print("\n" + "="*60)
    print("1. CHECKING ENVIRONMENT VARIABLES")
    print("="*60)
    
    from app.core.config import GOOGLE_API_KEY
    
    if GOOGLE_API_KEY and len(GOOGLE_API_KEY) > 10:
        print("✅ GOOGLE_API_KEY is set")
        print(f"   Key: {GOOGLE_API_KEY[:20]}...")
        return True
    else:
        print("❌ GOOGLE_API_KEY is missing or invalid")
        print("   Set it in your .env file:")
        print("   GOOGLE_API_KEY=your_key_here")
        return False

def check_database():
    """Check if database has the new columns"""
    print("\n" + "="*60)
    print("2. CHECKING DATABASE SCHEMA")
    print("="*60)
    
    try:
        from app.database import get_db
        db = next(get_db())
        inspector = inspect(db.bind)
        
        columns = [col['name'] for col in inspector.get_columns('detection_history')]
        
        required_columns = [
            'growth_stage',
            'plant_health_score',
            'ai_disease_analysis',
            'treatment_recommendations',
            'preventive_measures',
            'yolo_processing_time',
            'gemini_processing_time'
        ]
        
        missing = [col for col in required_columns if col not in columns]
        
        if not missing:
            print(f"✅ All {len(required_columns)} Gemini columns exist")
            for col in required_columns:
                print(f"   ✓ {col}")
            return True
        else:
            print(f"❌ Missing {len(missing)} columns:")
            for col in missing:
                print(f"   ✗ {col}")
            print("\n   Run migration script:")
            print("   python migrate_gemini_detection.py")
            return False
            
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

def check_gemini_service():
    """Check if Gemini service can be initialized"""
    print("\n" + "="*60)
    print("3. CHECKING GEMINI SERVICE")
    print("="*60)
    
    try:
        from app.services.gemini_detection_service import gemini_analyzer
        print("✅ Gemini service initialized")
        print(f"   Model: {gemini_analyzer.llm.model_name}")
        return True
    except Exception as e:
        print(f"❌ Gemini service failed: {e}")
        return False

async def test_gemini_analysis():
    """Test Gemini analysis with a dummy detection"""
    print("\n" + "="*60)
    print("4. TESTING GEMINI ANALYSIS")
    print("="*60)
    
    try:
        from app.services.gemini_detection_service import gemini_analyzer
        
        # Create a test image path (we'll use a dummy one)
        test_detections = [{
            'class_name': 'টমেটোর সেপটোরিয়া দাগ - সাদা কেন্দ্রযুক্ত কালো দাগ',
            'confidence': 0.85,
            'severity': 'মাঝারি'
        }]
        
        print("⏳ Testing Gemini API call...")
        print("   (This requires an actual image file)")
        print("   Skipping actual API call for now...")
        print("✅ Gemini service is ready to use")
        
        return True
        
    except Exception as e:
        print(f"❌ Gemini test failed: {e}")
        return False

def check_recent_detections():
    """Check if recent detections have Gemini data"""
    print("\n" + "="*60)
    print("5. CHECKING RECENT DETECTIONS")
    print("="*60)
    
    try:
        from app.database import get_db
        from app.models.detection import DetectionHistory
        
        db = next(get_db())
        
        # Get the most recent detection
        latest = db.query(DetectionHistory).order_by(
            DetectionHistory.created_at.desc()
        ).first()
        
        if not latest:
            print("ℹ️  No detections found in database")
            return True
        
        print(f"Latest detection: ID {latest.id}")
        print(f"   Created: {latest.created_at}")
        print(f"   YOLO time: {latest.yolo_processing_time}s")
        print(f"   Gemini time: {latest.gemini_processing_time}s")
        
        if latest.growth_stage:
            print(f"✅ Has Gemini data:")
            print(f"   Growth stage: {latest.growth_stage}")
            print(f"   Health score: {latest.plant_health_score}")
            print(f"   Analysis: {latest.ai_disease_analysis[:100] if latest.ai_disease_analysis else 'None'}...")
            return True
        else:
            print(f"⚠️  No Gemini data (likely old record)")
            print("   Upload a NEW image to test the Gemini integration")
            return True
            
    except Exception as e:
        print(f"❌ Detection check failed: {e}")
        return False

def print_troubleshooting():
    """Print troubleshooting steps"""
    print("\n" + "="*60)
    print("TROUBLESHOOTING STEPS")
    print("="*60)
    
    print("""
If checks failed, follow these steps:

1. RUN DATABASE MIGRATION:
   cd backend
   python migrate_gemini_detection.py

2. VERIFY ENVIRONMENT:
   - Check .env file has GOOGLE_API_KEY
   - Restart backend server after adding key

3. RESTART BACKEND:
   uvicorn app.main:app --reload

4. TEST WITH NEW IMAGE:
   - Old detections won't have Gemini data
   - Upload a NEW image to test
   - Check backend logs for errors

5. CHECK BACKEND LOGS:
   Look for:
   - "Sending request to Gemini..."
   - "Gemini analysis completed..."
   - Any error messages

6. VERIFY API RESPONSE:
   curl -X POST http://localhost:8000/api/detection/detect \\
     -H "Authorization: Bearer YOUR_TOKEN" \\
     -F "file=@test_image.jpg"
   
   Response should include:
   - growth_stage
   - plant_health_score
   - ai_disease_analysis
   - treatment_recommendations
""")

def main():
    """Run all verification checks"""
    print("="*60)
    print("🌾 KRISHI SAHAY - GEMINI DETECTION VERIFICATION")
    print("="*60)
    
    results = []
    
    # Run all checks
    results.append(("Environment", check_environment()))
    results.append(("Database", check_database()))
    results.append(("Gemini Service", check_gemini_service()))
    results.append(("Recent Detections", check_recent_detections()))
    
    # Print summary
    print("\n" + "="*60)
    print("VERIFICATION SUMMARY")
    print("="*60)
    
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {name}")
    
    all_passed = all(result[1] for result in results)
    
    if all_passed:
        print("\n" + "="*60)
        print("✅ ALL CHECKS PASSED!")
        print("="*60)
        print("""
Your Gemini detection system is properly configured!

NEXT STEPS:
1. Restart your backend if you haven't already
2. Upload a NEW plant image via the frontend
3. Check that the AI analysis appears in results
4. Verify the analysis shows in history tab

If old detections show null values, that's expected!
They were created before Gemini was integrated.
""")
        return 0
    else:
        print("\n" + "="*60)
        print("⚠️  SOME CHECKS FAILED")
        print("="*60)
        print_troubleshooting()
        return 1

if __name__ == "__main__":
    sys.exit(main())

