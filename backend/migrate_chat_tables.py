#!/usr/bin/env python3
"""
Migration script to update chat tables with new fields
Run this once to update your existing database schema
"""

import sqlite3
from datetime import datetime

def migrate_chat_tables():
    # Connect to database
    conn = sqlite3.connect('krishi_sahay.db')
    cursor = conn.cursor()
    
    try:
        print("Starting migration...")
        
        # First, let's check if the tables exist and what columns they have
        cursor.execute("PRAGMA table_info(chat_sessions)")
        existing_session_columns = [col[1] for col in cursor.fetchall()]
        print(f"Existing chat_sessions columns: {existing_session_columns}")
        
        cursor.execute("PRAGMA table_info(chat_messages)")
        existing_message_columns = [col[1] for col in cursor.fetchall()]
        print(f"Existing chat_messages columns: {existing_message_columns}")
        
        # Add missing columns to chat_sessions
        session_columns_to_add = [
            ("title", "VARCHAR(500) DEFAULT 'নতুন কথোপকথন'"),
            ("session_type", "VARCHAR(50) DEFAULT 'general'"),
            ("language", "VARCHAR(10) DEFAULT 'bn'"),
            ("location_context", "JSON"),
            ("crop_context", "JSON"),
            ("season_context", "VARCHAR(50)"),
            ("is_active", "BOOLEAN DEFAULT 1"),
            ("is_starred", "BOOLEAN DEFAULT 0"),
            ("conversation_summary", "TEXT"),
            ("key_topics", "JSON"),
            ("action_items", "JSON"),
            ("last_activity", f"DATETIME DEFAULT '{datetime.utcnow().isoformat()}'")
        ]
        
        for col_name, col_type in session_columns_to_add:
            if col_name not in existing_session_columns:
                try:
                    cursor.execute(f"ALTER TABLE chat_sessions ADD COLUMN {col_name} {col_type}")
                    print(f"Added column {col_name} to chat_sessions")
                except sqlite3.OperationalError as e:
                    print(f"Could not add column {col_name}: {e}")
        
        # Add missing columns to chat_messages
        message_columns_to_add = [
            ("message_id", "VARCHAR(255) UNIQUE"),
            ("original_content", "TEXT"),
            ("language", "VARCHAR(10) DEFAULT 'bn'"),
            ("role", "VARCHAR(20) DEFAULT 'user'"),
            ("message_type", "VARCHAR(20) DEFAULT 'text'"),
            ("image_file", "VARCHAR(500)"),
            ("attachments", "JSON"),
            ("voice_confidence", "REAL"),
            ("voice_duration", "REAL"),
            ("tool_calls", "JSON"),
            ("tool_outputs", "JSON"),
            ("processing_time", "REAL"),
            ("confidence_score", "REAL"),
            ("user_rating", "INTEGER"),
            ("user_feedback", "TEXT"),
            ("is_helpful", "BOOLEAN"),
            ("edited_at", "DATETIME")
        ]
        
        for col_name, col_type in message_columns_to_add:
            if col_name not in existing_message_columns:
                try:
                    cursor.execute(f"ALTER TABLE chat_messages ADD COLUMN {col_name} {col_type}")
                    print(f"Added column {col_name} to chat_messages")
                except sqlite3.OperationalError as e:
                    print(f"Could not add column {col_name}: {e}")
        
        # Remove the old is_user column if it exists and populate role column
        if "is_user" in existing_message_columns and "role" in [col[0] for col in message_columns_to_add]:
            try:
                # Update role based on is_user
                cursor.execute("UPDATE chat_messages SET role = CASE WHEN is_user = 1 THEN 'user' ELSE 'assistant' END WHERE role IS NULL")
                print("Updated role column based on is_user")
                
                # Note: SQLite doesn't support DROP COLUMN easily, so we'll leave is_user for now
                print("Note: is_user column still exists but role column is now used")
            except sqlite3.OperationalError as e:
                print(f"Could not update role column: {e}")
        
        # Generate unique message_ids for existing messages that don't have them
        if "message_id" in [col[0] for col in message_columns_to_add]:
            cursor.execute("SELECT id FROM chat_messages WHERE message_id IS NULL")
            messages_without_id = cursor.fetchall()
            
            import uuid
            for (msg_id,) in messages_without_id:
                new_uuid = str(uuid.uuid4())
                cursor.execute("UPDATE chat_messages SET message_id = ? WHERE id = ?", (new_uuid, msg_id))
            
            if messages_without_id:
                print(f"Generated message_ids for {len(messages_without_id)} existing messages")
        
        # Update last_activity for existing sessions
        cursor.execute("UPDATE chat_sessions SET last_activity = updated_at WHERE last_activity IS NULL")
        print("Updated last_activity for existing sessions")
        
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_chat_tables()
