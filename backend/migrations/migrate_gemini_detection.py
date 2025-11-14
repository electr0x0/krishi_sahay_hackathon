#!/usr/bin/env python3
"""
Migration script to add Gemini AI analysis fields to detection_history table
Run this once to update your existing database schema with enhanced detection capabilities
"""

import sqlite3
from datetime import datetime

def migrate_gemini_detection():
    # Connect to database
    conn = sqlite3.connect('krishi_sahay.db')
    cursor = conn.cursor()
    
    try:
        print("Starting Gemini detection analysis migration...")
        
        # Check if detection_history table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='detection_history'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("❌ detection_history table does not exist. Please create it first.")
            return
        
        print("✅ detection_history table found")
        
        # Get existing columns
        cursor.execute("PRAGMA table_info(detection_history)")
        existing_columns = [col[1] for col in cursor.fetchall()]
        
        # Define new columns to add
        new_columns = [
            ("growth_stage", "VARCHAR(255)", "Growth stage in Bengali"),
            ("growth_stage_en", "VARCHAR(255)", "Growth stage in English"),
            ("plant_health_score", "FLOAT", "Plant health score 0-100"),
            ("ai_disease_analysis", "TEXT", "Detailed disease analysis in Bengali"),
            ("ai_disease_analysis_en", "TEXT", "Detailed disease analysis in English"),
            ("treatment_recommendations", "TEXT", "Treatment recommendations in Bengali"),
            ("treatment_recommendations_en", "TEXT", "Treatment recommendations in English"),
            ("preventive_measures", "TEXT", "Preventive measures in Bengali"),
            ("preventive_measures_en", "TEXT", "Preventive measures in English"),
            ("expected_recovery_time", "VARCHAR(255)", "Expected recovery timeline"),
            ("severity_assessment", "VARCHAR(255)", "Overall severity assessment"),
            ("additional_observations", "TEXT", "Additional observations from AI"),
            ("gemini_processing_time", "FLOAT", "Time taken for Gemini analysis"),
            ("yolo_processing_time", "FLOAT", "Time taken for YOLO detection"),
        ]
        
        # Add new columns
        columns_added = 0
        for column_name, column_type, description in new_columns:
            if column_name not in existing_columns:
                try:
                    alter_sql = f"ALTER TABLE detection_history ADD COLUMN {column_name} {column_type}"
                    cursor.execute(alter_sql)
                    print(f"✅ Added column: {column_name} ({description})")
                    columns_added += 1
                except sqlite3.OperationalError as e:
                    print(f"⚠️  Could not add column {column_name}: {e}")
            else:
                print(f"ℹ️  Column {column_name} already exists")
        
        if columns_added > 0:
            print(f"\n✅ Successfully added {columns_added} new columns")
        else:
            print("\nℹ️  All columns already exist, no changes needed")
        
        # Create indexes for better query performance
        print("\nCreating indexes for performance optimization...")
        
        indexes = [
            ("idx_detection_history_plant_health_score", "plant_health_score", "Health score index"),
            ("idx_detection_history_severity_assessment", "severity_assessment", "Severity index"),
            ("idx_detection_history_growth_stage", "growth_stage", "Growth stage index"),
        ]
        
        indexes_created = 0
        for index_name, column_name, description in indexes:
            try:
                # Check if index exists
                cursor.execute(f"SELECT name FROM sqlite_master WHERE type='index' AND name='{index_name}'")
                index_exists = cursor.fetchone()
                
                if not index_exists:
                    create_index_sql = f"CREATE INDEX {index_name} ON detection_history ({column_name})"
                    cursor.execute(create_index_sql)
                    print(f"✅ Created index: {index_name} ({description})")
                    indexes_created += 1
                else:
                    print(f"ℹ️  Index {index_name} already exists")
            except sqlite3.OperationalError as e:
                print(f"⚠️  Could not create index {index_name}: {e}")
        
        if indexes_created > 0:
            print(f"\n✅ Successfully created {indexes_created} indexes")
        
        # Commit changes
        conn.commit()
        
        # Verify the migration
        print("\n" + "="*60)
        print("Migration Summary:")
        print("="*60)
        
        cursor.execute("PRAGMA table_info(detection_history)")
        all_columns = cursor.fetchall()
        
        gemini_columns = [col for col in all_columns if col[1] in [c[0] for c in new_columns]]
        
        if gemini_columns:
            print(f"✅ {len(gemini_columns)} Gemini analysis columns confirmed in database")
            print("\nGemini Analysis Fields:")
            for col in gemini_columns:
                print(f"  - {col[1]} ({col[2]})")
        else:
            print("⚠️  Warning: No Gemini columns found after migration")
        
        print("\n" + "="*60)
        print("✅ Migration completed successfully!")
        print("="*60)
        print("\nYour detection system now supports:")
        print("  🧠 Gemini 2.5 Flash AI analysis")
        print("  📊 Plant health scoring")
        print("  🌱 Growth stage identification")
        print("  💊 Treatment recommendations")
        print("  🛡️  Preventive measures")
        print("  ⏱️  Processing time tracking")
        print("\nNext steps:")
        print("  1. Restart your backend server")
        print("  2. Test detection with a plant image")
        print("  3. Verify AI analysis appears in results")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        print("Rolling back changes...")
        conn.rollback()
        print("Rollback completed. Database unchanged.")
    finally:
        conn.close()

def verify_migration():
    """Verify that the migration was successful"""
    try:
        conn = sqlite3.connect('krishi_sahay.db')
        cursor = conn.cursor()
        
        cursor.execute("PRAGMA table_info(detection_history)")
        columns = [col[1] for col in cursor.fetchall()]
        
        required_columns = [
            'growth_stage',
            'plant_health_score',
            'ai_disease_analysis',
            'treatment_recommendations',
            'yolo_processing_time',
            'gemini_processing_time'
        ]
        
        missing = [col for col in required_columns if col not in columns]
        
        if not missing:
            print("\n✅ Verification passed! All required columns exist.")
            return True
        else:
            print(f"\n⚠️  Verification failed. Missing columns: {', '.join(missing)}")
            return False
            
    except Exception as e:
        print(f"\n❌ Verification error: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("="*60)
    print("🌾 Krishi Sahay - Gemini Detection Migration")
    print("="*60)
    print("This script will add AI analysis capabilities to your")
    print("detection system by adding new database columns.")
    print("="*60)
    
    input("\nPress Enter to continue with the migration...")
    
    migrate_gemini_detection()
    
    print("\n" + "="*60)
    print("Verifying migration...")
    print("="*60)
    
    if verify_migration():
        print("\n🎉 All set! Your enhanced detection system is ready to use.")
    else:
        print("\n⚠️  Please check the errors above and try again.")

