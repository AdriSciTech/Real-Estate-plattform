-- Debug query to check what columns and data exist in properties table
-- Run this in your Supabase SQL editor to debug the properties loading issue

-- 1. Check what columns exist in the properties table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 


WHERE table_schema = 'public' 
  AND table_name = 'properties'
ORDER BY ordinal_position;

-- 2. Check how many properties exist
SELECT COUNT(*) as total_properties FROM properties;

-- 3. Show a sample of the data to see what fields have values
SELECT 
    id,
    title,
    price,
    rooms,
    bathrooms,
    type,
    status,
    lat,
    lng,
    images,
    address,
    city,
    created_at
FROM properties 
LIMIT 3;

-- 4. Check for any null or missing critical fields
SELECT 
    COUNT(*) as total,
    COUNT(title) as has_title,
    COUNT(price) as has_price,
    COUNT(rooms) as has_rooms,
    COUNT(bathrooms) as has_bathrooms,
    COUNT(type) as has_type,
    COUNT(lat) as has_lat,
    COUNT(lng) as has_lng,
    COUNT(images) as has_images,
    COUNT(address) as has_address
FROM properties;