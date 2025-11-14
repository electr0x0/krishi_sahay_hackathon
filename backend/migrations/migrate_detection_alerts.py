#!/usr/bin/env python3
"""
Migration script to create detection_alerts table
Run this once to update your existing database schema
"""

import sqlite3
from datetime import datetime

def migrate_detection_alerts():
    # Connect to database
    conn = sqlite3.connect('krishi_sahay.db')
    cursor = conn.cursor()
    
    try:
        print("Starting detection alerts migration...")
        
        # Check if detection_alerts table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='detection_alerts'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            # Create detection_alerts table
            create_table_sql = """
            CREATE TABLE detection_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                detection_history_id INTEGER NOT NULL,
                alert_type VARCHAR(50) NOT NULL,
                severity VARCHAR(20) DEFAULT 'medium',
                disease_names JSON,
                confidence_scores JSON,
                title_bn VARCHAR(500),
                title_en VARCHAR(500),
                message_bn TEXT,
                message_en TEXT,
                recommendations_bn TEXT,
                recommendations_en TEXT,
                is_read BOOLEAN DEFAULT 0,
                is_dismissed BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                read_at DATETIME,
                dismissed_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (detection_history_id) REFERENCES detection_history (id)
            )
            """
            
            cursor.execute(create_table_sql)
            print("Created detection_alerts table")
            
            # Create indexes for better performance
            indexes = [
                "CREATE INDEX idx_detection_alerts_user_id ON detection_alerts (user_id)",
                "CREATE INDEX idx_detection_alerts_created_at ON detection_alerts (created_at)",
                "CREATE INDEX idx_detection_alerts_is_read ON detection_alerts (is_read)",
                "CREATE INDEX idx_detection_alerts_severity ON detection_alerts (severity)",
                "CREATE INDEX idx_detection_alerts_alert_type ON detection_alerts (alert_type)"
            ]
            
            for index_sql in indexes:
                cursor.execute(index_sql)
                print(f"Created index: {index_sql.split(' ON ')[0].split(' ')[-1]}")
        else:
            print("detection_alerts table already exists")
        
        # Check if user table has pest_alerts column
        cursor.execute("PRAGMA table_info(users)")
        user_columns = [col[1] for col in cursor.fetchall()]
        
        if 'pest_alerts' not in user_columns:
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN pest_alerts BOOLEAN DEFAULT 1")
                print("Added pest_alerts column to users table")
            except sqlite3.OperationalError as e:
                print(f"Could not add pest_alerts column: {e}")
        else:
            print("pest_alerts column already exists in users table")
        
        # Commit changes
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_detection_alerts()
