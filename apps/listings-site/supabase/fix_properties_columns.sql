-- Fix properties table columns to match what the application expects
-- This will add missing columns or rename existing ones

-- First, let's check what columns we have
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'properties'
ORDER BY ordinal_position;

-- Add missing columns that the application expects
-- Add 'rooms' column (mapped to 'beds' in the app)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'rooms'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE properties ADD COLUMN rooms INTEGER DEFAULT 1;
        CREATE INDEX IF NOT EXISTS idx_properties_rooms ON properties(rooms);
    END IF;
END $$;

-- Add 'bathrooms' column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'bathrooms'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE properties ADD COLUMN bathrooms INTEGER DEFAULT 1;
        CREATE INDEX IF NOT EXISTS idx_properties_bathrooms ON properties(bathrooms);
    END IF;
END $$;

-- Add 'beds' column as an alias/duplicate for rooms if needed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'beds'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE properties ADD COLUMN beds INTEGER DEFAULT 1;
        CREATE INDEX IF NOT EXISTS idx_properties_beds ON properties(beds);
    END IF;
END $$;

-- Add 'baths' column as an alias for bathrooms if needed  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'baths'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE properties ADD COLUMN baths INTEGER DEFAULT 1;
        CREATE INDEX IF NOT EXISTS idx_properties_baths ON properties(baths);
    END IF;
END $$;

-- Update any existing data to have default values
UPDATE properties SET rooms = 1 WHERE rooms IS NULL;
UPDATE properties SET bathrooms = 1 WHERE bathrooms IS NULL;
UPDATE properties SET beds = rooms WHERE beds IS NULL;
UPDATE properties SET baths = bathrooms WHERE baths IS NULL;

-- Show the final column structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'properties'
ORDER BY ordinal_position;