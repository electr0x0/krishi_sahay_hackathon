-- Add heat_index column to sensor_data table
-- For SQLite

-- Add column if it doesn't exist
ALTER TABLE sensor_data ADD COLUMN heat_index FLOAT;

-- Calculate and update heat_index for existing records
UPDATE sensor_data 
SET heat_index = temperature + (0.348 * humidity) - 4.25
WHERE temperature IS NOT NULL 
  AND humidity IS NOT NULL 
  AND heat_index IS NULL;

