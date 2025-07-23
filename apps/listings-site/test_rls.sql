-- Test if RLS is blocking access to properties
-- Run this in your Supabase SQL editor

-- 1. Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'properties';

-- 2. Try to select properties (this might fail if RLS blocks it)
SELECT id, title, price, address 
FROM properties 
LIMIT 5;

-- 3. Temporarily disable RLS for testing (ONLY for debugging)
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;

-- 4. Try select again after disabling RLS
SELECT id, title, price, address 
FROM properties 
LIMIT 5;