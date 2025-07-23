-- Clean RLS fix - handles existing policies properly
-- Run this in your Supabase SQL editor

-- Enable RLS on properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely (no error if they don't exist)
DROP POLICY IF EXISTS "Properties are viewable by authenticated users" ON properties;
DROP POLICY IF EXISTS "Properties are publicly viewable" ON properties;
DROP POLICY IF EXISTS "Property owners can update own properties" ON properties;
DROP POLICY IF EXISTS "Property owners can insert properties" ON properties;

-- Create new public read policy
CREATE POLICY "Properties are publicly viewable" ON properties
    FOR SELECT USING (true);

-- Create policy for property owners to update their properties  
CREATE POLICY "Property owners can update own properties" ON properties
    FOR UPDATE USING (auth.uid() = owner_id);

-- Create policy for property owners to insert new properties
CREATE POLICY "Property owners can insert properties" ON properties
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Test the policy by selecting properties
SELECT 'RLS Test' as test_result, 
       COUNT(*) as total_properties_accessible
FROM properties;