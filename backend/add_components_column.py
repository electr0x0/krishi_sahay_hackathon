"""
Migration script to add components column to chat_messages table
"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'krishi_sahay.db')

print(f"🔧 Adding components column to chat_messages table...")
print(f"📂 Database: {db_path}")

try:
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if column already exists
    cursor.execute("PRAGMA table_info(chat_messages)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'components' in columns:
        print("✅ Column 'components' already exists!")
    else:
        # Add components column
        cursor.execute("""
            ALTER TABLE chat_messages 
            ADD COLUMN components TEXT
        """)
        conn.commit()
        print("✅ Successfully added 'components' column!")
    
    # Verify the column exists
    cursor.execute("PRAGMA table_info(chat_messages)")
    columns = cursor.fetchall()
    
    print(f"\n📋 Current chat_messages columns:")
    for col in columns:
        print(f"   - {col[1]} ({col[2]})")
    
    conn.close()
    print("\n✨ Migration completed successfully!")
    
except Exception as e:
    print(f"❌ Error during migration: {e}")
    import traceback
    traceback.print_exc()
