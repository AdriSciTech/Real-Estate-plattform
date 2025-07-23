-- Add missing columns to properties table to match API expectations
-- Run this in your Supabase SQL editor

-- Add lat/lng columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'lat'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE properties ADD COLUMN lat DECIMAL(10,8);
        CREATE INDEX IF NOT EXISTS idx_properties_lat ON properties(lat);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'lng'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE properties ADD COLUMN lng DECIMAL(11,8);
        CREATE INDEX IF NOT EXISTS idx_properties_lng ON properties(lng);
    END IF;
END $$;

-- Add type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE properties ADD COLUMN type VARCHAR(50) DEFAULT 'Apartment';
        CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
    END IF;
END $$;

-- Update existing properties with default coordinates for Madrid if they don't have them
UPDATE properties 
SET lat = 40.4168, lng = -3.7038 
WHERE lat IS NULL OR lng IS NULL;

-- Update existing properties with default type if they don't have it
UPDATE properties 
SET type = 'Apartment' 
WHERE type IS NULL OR type = '';

-- Show current properties count
SELECT 
    COUNT(*) as total_properties,
    COUNT(CASE WHEN lat IS NOT NULL THEN 1 END) as properties_with_coordinates,
    COUNT(CASE WHEN type IS NOT NULL THEN 1 END) as properties_with_type
FROM properties;