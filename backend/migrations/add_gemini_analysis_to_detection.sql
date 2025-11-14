-- Migration: Add Gemini AI Analysis fields to detection_history table
-- Date: 2025-11-14
-- Description: Adds comprehensive AI analysis fields from Gemini to enhance YOLO detections

-- Add Gemini AI Analysis columns
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS growth_stage VARCHAR(255);
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS growth_stage_en VARCHAR(255);
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS plant_health_score FLOAT;
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS ai_disease_analysis TEXT;
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS ai_disease_analysis_en TEXT;
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS treatment_recommendations TEXT;
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS treatment_recommendations_en TEXT;
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS preventive_measures TEXT;
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS preventive_measures_en TEXT;
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS expected_recovery_time VARCHAR(255);
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS severity_assessment VARCHAR(255);
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS additional_observations TEXT;
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS gemini_processing_time FLOAT;
ALTER TABLE detection_history ADD COLUMN IF NOT EXISTS yolo_processing_time FLOAT;

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_detection_history_plant_health_score ON detection_history(plant_health_score);
CREATE INDEX IF NOT EXISTS idx_detection_history_severity_assessment ON detection_history(severity_assessment);
CREATE INDEX IF NOT EXISTS idx_detection_history_growth_stage ON detection_history(growth_stage);

-- Add comment to table
COMMENT ON COLUMN detection_history.growth_stage IS 'Plant growth stage in Bengali (বৃদ্ধির পর্যায়)';
COMMENT ON COLUMN detection_history.plant_health_score IS 'Overall plant health score from 0-100 (AI-generated)';
COMMENT ON COLUMN detection_history.ai_disease_analysis IS 'Detailed disease analysis from Gemini AI in Bengali';
COMMENT ON COLUMN detection_history.treatment_recommendations IS 'Treatment recommendations from Gemini AI in Bengali';
COMMENT ON COLUMN detection_history.preventive_measures IS 'Preventive measures from Gemini AI in Bengali';
COMMENT ON COLUMN detection_history.gemini_processing_time IS 'Time taken for Gemini AI analysis in seconds';
COMMENT ON COLUMN detection_history.yolo_processing_time IS 'Time taken for YOLO detection in seconds';

