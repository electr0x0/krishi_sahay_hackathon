#!/usr/bin/env python3
"""
Migration script to ensure all users have preferences
Run this once to create default preferences for existing users
"""

import sqlite3
from datetime import datetime

def migrate_user_preferences():
    # Connect to database
    conn = sqlite3.connect('krishi_sahay.db')
    cursor = conn.cursor()
    
    try:
        print("Starting user preferences migration...")
        
        # Check if user_preferences table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_preferences'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("user_preferences table does not exist, skipping migration")
            return
        
        # Get all users who don't have preferences
        cursor.execute("""
            SELECT u.id 
            FROM users u 
            LEFT JOIN user_preferences up ON u.id = up.user_id 
            WHERE up.user_id IS NULL
        """)
        
        users_without_preferences = cursor.fetchall()
        
        if not users_without_preferences:
            print("All users already have preferences")
            return
        
        print(f"Found {len(users_without_preferences)} users without preferences")
        
        # Create default preferences for users who don't have them
        for (user_id,) in users_without_preferences:
            cursor.execute("""
                INSERT INTO user_preferences (
                    user_id, preferred_language, voice_enabled, sms_notifications,
                    email_notifications, push_notifications, weather_alerts,
                    market_alerts, crop_alerts, pest_alerts, ai_assistance_level,
                    auto_suggestions, data_sharing, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, 'bn', 1, 1, 1, 1, 1, 1, 1, 1, 'medium', 1, 1,
                datetime.utcnow().isoformat()
            ))
            print(f"Created preferences for user {user_id}")
        
        # Commit changes
        conn.commit()
        print(f"Migration completed successfully! Created preferences for {len(users_without_preferences)} users.")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_user_preferences()
