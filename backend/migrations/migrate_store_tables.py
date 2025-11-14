"""
Migration: Add user_id and seller_user_id columns to store tables
"""
import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'krishi_sahay.db')
    
    print(f"🔄 Starting store tables migration...")
    print(f"📂 Database: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if store_products table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='store_products'")
        if cursor.fetchone():
            # Check if user_id column exists
            cursor.execute("PRAGMA table_info(store_products)")
            columns = [col[1] for col in cursor.fetchall()]
            
            if 'user_id' not in columns:
                print("➕ Adding user_id column to store_products...")
                cursor.execute("""
                    ALTER TABLE store_products 
                    ADD COLUMN user_id INTEGER REFERENCES users(id)
                """)
                print("✅ Added user_id column to store_products")
            else:
                print("ℹ️  user_id column already exists in store_products")
        
        # Check if store_listings table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='store_listings'")
        if cursor.fetchone():
            # Check if seller_user_id column exists
            cursor.execute("PRAGMA table_info(store_listings)")
            columns = [col[1] for col in cursor.fetchall()]
            
            if 'seller_user_id' not in columns:
                print("➕ Adding seller_user_id column to store_listings...")
                cursor.execute("""
                    ALTER TABLE store_listings 
                    ADD COLUMN seller_user_id INTEGER REFERENCES users(id)
                """)
                print("✅ Added seller_user_id column to store_listings")
            else:
                print("ℹ️  seller_user_id column already exists in store_listings")
        
        conn.commit()
        print("✅ Store tables migration completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
