-- COMPREHENSIVE DATABASE DEBUG QUERY
-- Copy and paste this entire query into your Supabase SQL editor and run it
-- Then share ALL the results with me

-- 1. SHOW ALL TABLES
SELECT 'TABLE LIST' as debug_section, table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. SHOW PROPERTIES TABLE STRUCTURE 
SELECT 'PROPERTIES COLUMNS' as debug_section, 
       column_name, 
       data_type, 
       is_nullable, 
       column_default,
       ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'properties'
ORDER BY ordinal_position;

-- 3. COUNT TOTAL PROPERTIES
SELECT 'PROPERTIES COUNT' as debug_section, 
       COUNT(*) as total_properties,
       COUNT(CASE WHEN title IS NOT NULL THEN 1 END) as with_title,
       COUNT(CASE WHEN price IS NOT NULL THEN 1 END) as with_price,
       COUNT(CASE WHEN address IS NOT NULL THEN 1 END) as with_address
FROM properties;

-- 4. SHOW SAMPLE PROPERTY DATA (first 3 properties)
SELECT 'SAMPLE PROPERTIES' as debug_section, *
FROM properties 
LIMIT 3;

-- 5. CHECK FOR SPECIFIC COLUMNS THE APP EXPECTS
SELECT 'COLUMN CHECK' as debug_section,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'rooms') 
            THEN 'EXISTS' ELSE 'MISSING' END as rooms_column,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bathrooms') 
            THEN 'EXISTS' ELSE 'MISSING' END as bathrooms_column,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'beds') 
            THEN 'EXISTS' ELSE 'MISSING' END as beds_column,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'baths') 
            THEN 'EXISTS' ELSE 'MISSING' END as baths_column,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'type') 
            THEN 'EXISTS' ELSE 'MISSING' END as type_column,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'lat') 
            THEN 'EXISTS' ELSE 'MISSING' END as lat_column,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'lng') 
            THEN 'EXISTS' ELSE 'MISSING' END as lng_column;

-- 6. CHECK ENVIRONMENT / RLS POLICIES
SELECT 'RLS CHECK' as debug_section,
       schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd,
       qual
FROM pg_policies 
WHERE tablename = 'properties';

-- 7. SHOW PROPERTY OWNERS TABLE (if exists)
SELECT 'PROPERTY_OWNERS COUNT' as debug_section, 
       COUNT(*) as total_owners
FROM property_owners;

-- 8. TEST A SIMPLE SELECT
SELECT 'SIMPLE SELECT TEST' as debug_section,
       id,
       title,
       price,
       address,
       created_at
FROM properties 
ORDER BY created_at DESC
LIMIT 5;