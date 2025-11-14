"""
Migration to add community support to store listings
- Adds community_id column to store_listings table
- Renames farmer_user_id to seller_user_id if needed
"""

import sqlite3
import sys
from pathlib import Path

# Add parent directory to path to import database module
sys.path.insert(0, str(Path(__file__).parent.parent))

def migrate():
    print("🔄 Starting store community support migration...")
    
    # Connect to database
    db_path = Path(__file__).parent.parent / "krishi_sahay.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check current columns
        cursor.execute("PRAGMA table_info(store_listings)")
        columns = {col[1]: col for col in cursor.fetchall()}
        
        # Add community_id column if it doesn't exist
        if 'community_id' not in columns:
            print("➕ Adding community_id column to store_listings...")
            cursor.execute("""
                ALTER TABLE store_listings 
                ADD COLUMN community_id INTEGER
            """)
            print("✅ Added community_id column")
        else:
            print("ℹ️  community_id column already exists")
        
        # Check if we need to migrate farmer_user_id to seller_user_id
        if 'farmer_user_id' in columns:
            print("🔄 Migrating farmer_user_id to seller_user_id...")
            # SQLite doesn't support RENAME COLUMN or DROP COLUMN easily, so we recreate the table
            
            # Get all data first
            cursor.execute("SELECT * FROM store_listings")
            rows = cursor.fetchall()
            old_columns = [col[1] for col in columns.values()]
            
            # Create new table with correct column names
            cursor.execute("""
                CREATE TABLE store_listings_new (
                    id INTEGER PRIMARY KEY,
                    product_id INTEGER NOT NULL,
                    seller_user_id INTEGER NOT NULL,
                    community_id INTEGER,
                    location VARCHAR(200) NOT NULL,
                    price FLOAT NOT NULL,
                    stock_qty FLOAT NOT NULL,
                    min_order_qty FLOAT NOT NULL,
                    harvest_date DATETIME,
                    quality_grade VARCHAR(50),
                    organic_certified BOOLEAN,
                    created_at DATETIME,
                    updated_at DATETIME,
                    is_active BOOLEAN
                )
            """)
            
            # Copy data, mapping old column names to new ones
            for row in rows:
                row_dict = dict(zip(old_columns, row))
                # Use farmer_user_id as seller_user_id, or seller_user_id if it already exists
                seller_id = row_dict.get('farmer_user_id') or row_dict.get('seller_user_id')
                cursor.execute("""
                    INSERT INTO store_listings_new 
                    (id, product_id, seller_user_id, community_id, location, price, stock_qty, min_order_qty, 
                     harvest_date, quality_grade, organic_certified, created_at, updated_at, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row_dict['id'],
                    row_dict['product_id'],
                    seller_id,
                    row_dict.get('community_id'),
                    row_dict['location'],
                    row_dict['price'],
                    row_dict['stock_qty'],
                    row_dict['min_order_qty'],
                    row_dict.get('harvest_date'),
                    row_dict.get('quality_grade', 'A'),
                    row_dict.get('organic_certified', 0),
                    row_dict.get('created_at'),
                    row_dict.get('updated_at'),
                    row_dict.get('is_active', 1)
                ))
            
            # Drop old table and rename new one
            cursor.execute("DROP TABLE store_listings")
            cursor.execute("ALTER TABLE store_listings_new RENAME TO store_listings")
            
            # Recreate indexes
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_store_listings_product_id ON store_listings(product_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_store_listings_seller_user_id ON store_listings(seller_user_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS ix_store_listings_community_id ON store_listings(community_id)")
            
            print("✅ Migrated farmer_user_id to seller_user_id and ensured community_id exists")
        else:
            print("ℹ️  Migration not needed - columns are already correct")
        
        conn.commit()
        print("✅ Store community support migration completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
