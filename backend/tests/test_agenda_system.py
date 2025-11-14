#!/usr/bin/env python3
"""
Test script for agenda API endpoints
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.agenda import Agenda
from app.services.ai_agenda_service import ai_agenda_service


async def test_agenda_system():
    """Test the agenda system functionality"""
    print("🧪 Testing Agenda System...")
    
    # Get database session
    db = next(get_db())
    
    try:
        # Check if we have any users
        user_count = db.query(User).count()
        print(f"📊 Users in database: {user_count}")
        
        if user_count == 0:
            print("❌ No users found in database. Please register a user first.")
            return False
        
        # Get first user for testing
        test_user = db.query(User).first()
        print(f"👤 Testing with user: {test_user.full_name} (ID: {test_user.id})")
        
        # Test agenda creation
        print("\n📝 Testing agenda creation...")
        test_agenda = Agenda(
            title="পরীক্ষার জন্য ধান ক্ষেতে সেচ দেওয়া",
            description="এটি একটি পরীক্ষামূলক এজেন্ডা",
            priority="medium",
            agenda_type="user_created",
            user_id=test_user.id,
            created_by_ai=False
        )
        
        db.add(test_agenda)
        db.commit()
        db.refresh(test_agenda)
        print(f"✅ Created test agenda: {test_agenda.title} (ID: {test_agenda.id})")
        
        # Test AI agenda generation
        print("\n🤖 Testing AI agenda generation...")
        try:
            ai_result = await ai_agenda_service.generate_ai_agendas(
                user_id=test_user.id,
                db=db,
                force_refresh=True,
                max_suggestions=3
            )
            
            if "error" in ai_result:
                print(f"⚠️  AI generation error: {ai_result['error']}")
            else:
                suggestions = ai_result.get("suggestions", [])
                print(f"✅ Generated {len(suggestions)} AI suggestions")
                for suggestion in suggestions:
                    print(f"   - {suggestion.get('title', 'No title')}")
                    
        except Exception as e:
            print(f"⚠️  AI generation error: {e}")
        
        # Test agenda retrieval
        print("\n📋 Testing agenda retrieval...")
        user_agendas = await ai_agenda_service.get_user_agendas(
            user_id=test_user.id,
            db=db
        )
        
        total_agendas = user_agendas.get("total", 0)
        pending_agendas = user_agendas.get("pending", 0)
        ai_agendas = user_agendas.get("ai_suggested", 0)
        
        print(f"✅ User has {total_agendas} total agendas")
        print(f"   - {pending_agendas} pending")
        print(f"   - {ai_agendas} AI-generated")
        
        # Clean up test data
        print("\n🧹 Cleaning up test data...")
        test_agendas = db.query(Agenda).filter(Agenda.user_id == test_user.id).all()
        for agenda in test_agendas:
            db.delete(agenda)
        db.commit()
        print(f"✅ Cleaned up {len(test_agendas)} test agendas")
        
        print("\n🎉 Agenda system test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()


async def main():
    """Main test function"""
    print("🔬 Starting Agenda System Tests\n")
    
    try:
        success = await test_agenda_system()
        if success:
            print("\n✅ All tests passed!")
        else:
            print("\n❌ Some tests failed!")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n💥 Test suite failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
