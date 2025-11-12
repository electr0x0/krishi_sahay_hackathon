#!/usr/bin/env python3
"""
Quick migration to add dialect columns to chat tables
"""

import sqlite3

def add_dialect_columns():
    # Connect to database
    conn = sqlite3.connect('krishi_sahay.db')
    cursor = conn.cursor()
    
    try:
        print("Adding dialect columns...")
        
        # Add dialect column to chat_sessions
        try:
            cursor.execute("ALTER TABLE chat_sessions ADD COLUMN dialect VARCHAR(10)")
            print("✓ Added dialect column to chat_sessions")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("✓ dialect column already exists in chat_sessions")
            else:
                raise
        
        # Add dialect columns to chat_messages
        dialect_columns = [
            ("dialect", "VARCHAR(10)"),
            ("detected_dialect", "VARCHAR(10)"),
            ("dialect_confidence", "REAL")
        ]
        
        for col_name, col_type in dialect_columns:
            try:
                cursor.execute(f"ALTER TABLE chat_messages ADD COLUMN {col_name} {col_type}")
                print(f"✓ Added {col_name} column to chat_messages")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e).lower():
                    print(f"✓ {col_name} column already exists in chat_messages")
                else:
                    raise
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    add_dialect_columns()
