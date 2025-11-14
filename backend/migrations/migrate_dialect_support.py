"""
Database migration to add dialect and multi-language support
Adds dialect preferences to user and chat session tables
"""

import sqlite3
from datetime import datetime

def migrate_dialect_support():
    """Add dialect support columns to existing tables"""
    
    db_path = "krishi_sahay.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔄 Starting dialect support migration...")
        
        # Add dialect column to users table if not exists
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN preferred_dialect VARCHAR(10) DEFAULT NULL
            """)
            print("✅ Added preferred_dialect to users table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("ℹ️  preferred_dialect column already exists in users table")
            else:
                print(f"⚠️  Error adding preferred_dialect to users: {e}")
        
        # Add region column to users table if not exists
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN region VARCHAR(50) DEFAULT NULL
            """)
            print("✅ Added region to users table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("ℹ️  region column already exists in users table")
            else:
                print(f"⚠️  Error adding region to users: {e}")
        
        # Add auto_detect_dialect column to users table
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN auto_detect_dialect BOOLEAN DEFAULT 1
            """)
            print("✅ Added auto_detect_dialect to users table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("ℹ️  auto_detect_dialect column already exists in users table")
            else:
                print(f"⚠️  Error adding auto_detect_dialect to users: {e}")
        
        # Add dialect column to chat_sessions table if not exists
        try:
            cursor.execute("""
                ALTER TABLE chat_sessions 
                ADD COLUMN dialect VARCHAR(10) DEFAULT NULL
            """)
            print("✅ Added dialect to chat_sessions table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("ℹ️  dialect column already exists in chat_sessions table")
            else:
                print(f"⚠️  Error adding dialect to chat_sessions: {e}")
        
        # Add detected_dialect column to chat_messages table
        try:
            cursor.execute("""
                ALTER TABLE chat_messages 
                ADD COLUMN detected_dialect VARCHAR(10) DEFAULT NULL
            """)
            print("✅ Added detected_dialect to chat_messages table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("ℹ️  detected_dialect column already exists in chat_messages table")
            else:
                print(f"⚠️  Error adding detected_dialect to chat_messages: {e}")
        
        # Add dialect_confidence column to chat_messages table
        try:
            cursor.execute("""
                ALTER TABLE chat_messages 
                ADD COLUMN dialect_confidence FLOAT DEFAULT NULL
            """)
            print("✅ Added dialect_confidence to chat_messages table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("ℹ️  dialect_confidence column already exists in chat_messages table")
            else:
                print(f"⚠️  Error adding dialect_confidence to chat_messages: {e}")
        
        # Create user_language_preferences table
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_language_preferences (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    primary_language VARCHAR(10) NOT NULL DEFAULT 'bn',
                    primary_dialect VARCHAR(10),
                    secondary_languages TEXT,
                    auto_detect BOOLEAN DEFAULT 1,
                    auto_translate BOOLEAN DEFAULT 0,
                    preferred_script VARCHAR(20) DEFAULT 'bengali_script',
                    tts_enabled BOOLEAN DEFAULT 0,
                    tts_dialect VARCHAR(10),
                    stt_enabled BOOLEAN DEFAULT 0,
                    stt_dialect VARCHAR(10),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            print("✅ Created user_language_preferences table")
        except sqlite3.OperationalError as e:
            if "already exists" in str(e).lower():
                print("ℹ️  user_language_preferences table already exists")
            else:
                print(f"⚠️  Error creating user_language_preferences: {e}")
        
        # Update existing users to have default dialect based on region
        print("\n🔄 Updating existing user dialects based on regions...")
        
        region_dialect_map = {
            'sylhet': 'bn-syl',
            'chittagong': 'bn-ctg',
            'noakhali': 'bn-noa',
            'rangpur': 'bn-ran'
        }
        
        for region, dialect in region_dialect_map.items():
            cursor.execute("""
                UPDATE users 
                SET preferred_dialect = ?,
                    region = ?
                WHERE district LIKE ? 
                AND (preferred_dialect IS NULL OR preferred_dialect = '')
            """, (dialect, region, f'%{region}%'))
            
            affected = cursor.rowcount
            if affected > 0:
                print(f"  ✅ Updated {affected} users in {region} to {dialect}")
        
        conn.commit()
        print("\n✅ Dialect support migration completed successfully!")
        
        # Show summary
        cursor.execute("SELECT COUNT(*) FROM users WHERE preferred_dialect IS NOT NULL")
        count = cursor.fetchone()[0]
        print(f"\n📊 Summary: {count} users now have dialect preferences")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {e}")
        raise
    
    finally:
        conn.close()


def create_language_preferences_for_existing_users():
    """Create language preferences for existing users"""
    
    db_path = "krishi_sahay.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("\n🔄 Creating language preferences for existing users...")
        
        # Get all users without language preferences
        cursor.execute("""
            SELECT u.id, u.preferred_language, u.preferred_dialect, u.region
            FROM users u
            LEFT JOIN user_language_preferences ulp ON u.id = ulp.user_id
            WHERE ulp.id IS NULL
        """)
        
        users = cursor.fetchall()
        
        for user_id, lang, dialect, region in users:
            cursor.execute("""
                INSERT INTO user_language_preferences 
                (user_id, primary_language, primary_dialect, auto_detect, auto_translate)
                VALUES (?, ?, ?, 1, 0)
            """, (user_id, lang or 'bn', dialect, ))
        
        conn.commit()
        print(f"✅ Created language preferences for {len(users)} users")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Failed to create language preferences: {e}")
        raise
    
    finally:
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("🌍 Krishi Sahay Multi-Dialect Support Migration")
    print("=" * 60)
    
    migrate_dialect_support()
    create_language_preferences_for_existing_users()
    
    print("\n" + "=" * 60)
    print("✅ Migration completed! Your system now supports:")
    print("   - Standard Bengali (প্রমিত বাংলা)")
    print("   - Sylheti (ꠍꠤꠟꠐꠤ)")
    print("   - Chittagonian (চাটগাঁইয়া)")
    print("   - Noakhailla (নোয়াখাইল্লা)")
    print("   - Rangpuri (রংপুরী)")
    print("   - English, Hindi, Urdu")
    print("=" * 60)
