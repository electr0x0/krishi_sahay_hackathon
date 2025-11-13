"""
Database migration to add role column to users table
Adds role column for user role management (user, premium, moderator, admin)
"""

import sqlite3
import os

def migrate_add_role_column():
    """Add role column to users table if it doesn't exist"""
    
    # Use default database path (same directory as script)
    db_filename = "krishi_sahay.db"
    
    # Handle relative paths - check both current dir and backend dir
    script_dir = os.path.dirname(os.path.abspath(__file__))
    possible_paths = [
        os.path.join(script_dir, db_filename),
        os.path.join(script_dir, "..", db_filename),
        db_filename
    ]
    
    # Find the database file
    db_path = None
    for path in possible_paths:
        if os.path.exists(path):
            db_path = path
            break
    
    if not db_path:
        # Default to backend directory
        db_path = os.path.join(script_dir, db_filename)
        print(f"[WARNING] Database file not found, will create at: {db_path}")
    
    print(f"[INFO] Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("[INFO] Starting role column migration...")
        
        # Check if role column already exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "role" in columns:
            print("[INFO] role column already exists in users table")
            return True
        
        # Add role column to users table
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN role VARCHAR(20) DEFAULT 'user'
            """)
            print("[SUCCESS] Added role column to users table")
            
            # Update existing users to have 'user' role if they don't have one
            cursor.execute("""
                UPDATE users 
                SET role = 'user' 
                WHERE role IS NULL OR role = ''
            """)
            updated_count = cursor.rowcount
            if updated_count > 0:
                print(f"[SUCCESS] Updated {updated_count} existing users with default 'user' role")
            
            conn.commit()
            print("\n[SUCCESS] Role column migration completed successfully!")
            return True
            
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("[INFO] role column already exists in users table")
                return True
            else:
                print(f"[ERROR] Error adding role column: {e}")
                conn.rollback()
                return False
        
    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Migration failed: {e}")
        raise
    
    finally:
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Krishi Sahay User Role Migration")
    print("=" * 60)
    
    success = migrate_add_role_column()
    
    if success:
        print("\n" + "=" * 60)
        print("[SUCCESS] Migration completed! Users table now supports roles:")
        print("   - user (default)")
        print("   - premium")
        print("   - moderator")
        print("   - admin")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("[ERROR] Migration failed. Please check the error messages above.")
        print("=" * 60)

