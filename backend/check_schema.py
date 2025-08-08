import sqlite3

def check_schema():
    """Check the actual database schema"""
    try:
        conn = sqlite3.connect('krishi_sahay.db')
        cursor = conn.cursor()
        
        # Get table info
        cursor.execute("PRAGMA table_info(sensor_data)")
        columns = cursor.fetchall()
        
        print("📋 sensor_data table schema:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_schema()
