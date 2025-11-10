"""
Set admin role for admin user
"""
import sqlite3

conn = sqlite3.connect('krishi_sahay.db')
cursor = conn.cursor()

# Set admin role
cursor.execute('UPDATE users SET role = "admin" WHERE email = "admin@krishisahay.com"')
conn.commit()

# Verify
cursor.execute('SELECT id, email, full_name, role FROM users WHERE email = "admin@krishisahay.com"')
admin = cursor.fetchone()

if admin:
    print(f"✅ Admin role set successfully!")
    print(f"   ID: {admin[0]}")
    print(f"   Email: {admin[1]}")
    print(f"   Name: {admin[2]}")
    print(f"   Role: {admin[3]}")

conn.close()
