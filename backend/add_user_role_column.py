"""
Migration script to add role column to users table
"""
import sqlite3

def add_role_column():
    try:
        # Connect to database
        conn = sqlite3.connect('krishi_sahay.db')
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'role' not in columns:
            print("Adding 'role' column to users table...")
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN role TEXT DEFAULT 'user'
            """)
            
            # Set default role for existing users
            cursor.execute("""
                UPDATE users 
                SET role = 'user' 
                WHERE role IS NULL
            """)
            
            conn.commit()
            print("✅ Successfully added 'role' column to users table")
            print("✅ Set default role 'user' for all existing users")
        else:
            print("ℹ️  'role' column already exists in users table")
        
        # Show current users and their roles
        cursor.execute("SELECT id, email, full_name, role FROM users LIMIT 10")
        users = cursor.fetchall()
        
        if users:
            print("\n📋 Current users:")
            for user in users:
                print(f"  ID: {user[0]} | Email: {user[1]} | Name: {user[2]} | Role: {user[3]}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_role_column()
