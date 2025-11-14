#!/usr/bin/env python3
"""
Migration script to add Gemini AI analysis fields to detection_history table (PostgreSQL)
Run this for PostgreSQL databases in production
"""

import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_postgres_connection():
    """Get PostgreSQL connection from environment variables"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'krishi_sahay'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'password')
    )

def migrate_gemini_detection_postgres():
    """Add Gemini analysis fields to PostgreSQL database"""
    
    try:
        # Connect to database
        print("Connecting to PostgreSQL database...")
        conn = get_postgres_connection()
        cursor = conn.cursor()
        
        print("✅ Connected to database")
        print("\nStarting Gemini detection analysis migration...")
        
        # Check if detection_history table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'detection_history'
            )
        """)
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print("❌ detection_history table does not exist. Please create it first.")
            return
        
        print("✅ detection_history table found")
        
        # Get existing columns
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'detection_history'
        """)
        existing_columns = [row[0] for row in cursor.fetchall()]
        
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
                    alter_sql = f"ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS {column_name} {column_type}"
                    cursor.execute(alter_sql)
                    print(f"✅ Added column: {column_name} ({description})")
                    columns_added += 1
                except psycopg2.Error as e:
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
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM pg_indexes 
                        WHERE indexname = %s
                    )
                """, (index_name,))
                index_exists = cursor.fetchone()[0]
                
                if not index_exists:
                    create_index_sql = f"CREATE INDEX IF NOT EXISTS {index_name} ON detection_history ({column_name})"
                    cursor.execute(create_index_sql)
                    print(f"✅ Created index: {index_name} ({description})")
                    indexes_created += 1
                else:
                    print(f"ℹ️  Index {index_name} already exists")
            except psycopg2.Error as e:
                print(f"⚠️  Could not create index {index_name}: {e}")
        
        if indexes_created > 0:
            print(f"\n✅ Successfully created {indexes_created} indexes")
        
        # Add comments to columns (PostgreSQL feature)
        print("\nAdding column comments...")
        comments = [
            ("growth_stage", "Plant growth stage in Bengali (বৃদ্ধির পর্যায়)"),
            ("plant_health_score", "Overall plant health score from 0-100 (AI-generated)"),
            ("ai_disease_analysis", "Detailed disease analysis from Gemini AI in Bengali"),
            ("treatment_recommendations", "Treatment recommendations from Gemini AI in Bengali"),
            ("preventive_measures", "Preventive measures from Gemini AI in Bengali"),
            ("gemini_processing_time", "Time taken for Gemini AI analysis in seconds"),
            ("yolo_processing_time", "Time taken for YOLO detection in seconds"),
        ]
        
        for column_name, comment in comments:
            try:
                comment_sql = f"COMMENT ON COLUMN detection_history.{column_name} IS %s"
                cursor.execute(comment_sql, (comment,))
            except psycopg2.Error as e:
                print(f"⚠️  Could not add comment for {column_name}: {e}")
        
        # Commit changes
        conn.commit()
        
        # Verify the migration
        print("\n" + "="*60)
        print("Migration Summary:")
        print("="*60)
        
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'detection_history'
            AND column_name IN (
                'growth_stage', 'plant_health_score', 'ai_disease_analysis',
                'treatment_recommendations', 'preventive_measures',
                'gemini_processing_time', 'yolo_processing_time'
            )
            ORDER BY column_name
        """)
        gemini_columns = cursor.fetchall()
        
        if gemini_columns:
            print(f"✅ {len(gemini_columns)} Gemini analysis columns confirmed in database")
            print("\nGemini Analysis Fields:")
            for col_name, col_type in gemini_columns:
                print(f"  - {col_name} ({col_type})")
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
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"\n❌ Migration failed: {e}")
        print("Rolling back changes...")
        if conn:
            conn.rollback()
            conn.close()
        print("Rollback completed. Database unchanged.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        if conn:
            conn.close()

def verify_migration_postgres():
    """Verify that the migration was successful"""
    try:
        conn = get_postgres_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'detection_history'
        """)
        columns = [row[0] for row in cursor.fetchall()]
        
        required_columns = [
            'growth_stage',
            'plant_health_score',
            'ai_disease_analysis',
            'treatment_recommendations',
            'yolo_processing_time',
            'gemini_processing_time'
        ]
        
        missing = [col for col in required_columns if col not in columns]
        
        cursor.close()
        conn.close()
        
        if not missing:
            print("\n✅ Verification passed! All required columns exist.")
            return True
        else:
            print(f"\n⚠️  Verification failed. Missing columns: {', '.join(missing)}")
            return False
            
    except Exception as e:
        print(f"\n❌ Verification error: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("🌾 Krishi Sahay - Gemini Detection Migration (PostgreSQL)")
    print("="*60)
    print("This script will add AI analysis capabilities to your")
    print("PostgreSQL detection system by adding new database columns.")
    print("="*60)
    print("\nMake sure you have set these environment variables:")
    print("  - DB_HOST")
    print("  - DB_PORT")
    print("  - DB_NAME")
    print("  - DB_USER")
    print("  - DB_PASSWORD")
    print("="*60)
    
    input("\nPress Enter to continue with the migration...")
    
    migrate_gemini_detection_postgres()
    
    print("\n" + "="*60)
    print("Verifying migration...")
    print("="*60)
    
    if verify_migration_postgres():
        print("\n🎉 All set! Your enhanced detection system is ready to use.")
    else:
        print("\n⚠️  Please check the errors above and try again.")

