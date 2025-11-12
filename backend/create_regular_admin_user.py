"""
Create a regular user account with admin credentials
So admin can login to the normal app
"""

import sqlite3
from datetime import datetime
from app.auth.security import get_password_hash

# Connect to database
conn = sqlite3.connect('krishi_sahay.db')
cursor = conn.cursor()

# Check if user already exists
cursor.execute("SELECT id FROM users WHERE email = ?", ('admin@krishisahay.com',))
existing = cursor.fetchone()

if existing:
    print("✅ Admin user already exists in users table")
    print(f"   User ID: {existing[0]}")
else:
    # Hash the password using bcrypt (same as regular auth)
    # Note: The regular auth expects bcrypt, not SHA256
    import bcrypt
    password_bytes = 'admin123'.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    # Insert admin user
    cursor.execute("""
        INSERT INTO users (
            email, 
            phone, 
            full_name, 
            hashed_password, 
            division, 
            district, 
            upazila,
            is_active,
            is_verified,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'admin@krishisahay.com',
        '+8801700000000',  # Dummy phone
        'System Administrator',
        hashed_password,
        'Dhaka',
        'Dhaka',
        'Dhaka Sadar',
        1,  # Active
        1,  # Verified
        datetime.now().isoformat()
    ))
    
    conn.commit()
    
    user_id = cursor.lastrowid
    
    # Create default preferences
    cursor.execute("""
        INSERT INTO user_preferences (
            user_id,
            preferred_language,
            voice_enabled,
            sms_notifications,
            email_notifications
        ) VALUES (?, ?, ?, ?, ?)
    """, (user_id, 'en', 1, 1, 1))
    
    conn.commit()
    
    print("✅ Admin user created successfully in users table!")
    print(f"   User ID: {user_id}")
    print(f"   Email: admin@krishisahay.com")
    print(f"   Password: admin123")
    print("\n📱 You can now login to the normal app with these credentials")

conn.close()
