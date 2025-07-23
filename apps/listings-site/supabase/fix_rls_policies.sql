-- Fix RLS policies to allow public viewing of properties
-- Only require login for reservation dashboard actions

-- Enable RLS but allow public read access
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for properties
DROP POLICY IF EXISTS "Properties are viewable by authenticated users" ON properties;
DROP POLICY IF EXISTS "Property owners can update own properties" ON properties;

-- Create new policy for public read access
CREATE POLICY "Properties are publicly viewable" ON properties
    FOR SELECT USING (true);

-- Create policy for property owners to update their properties
CREATE POLICY "Property owners can update own properties" ON properties
    FOR UPDATE USING (auth.uid() = owner_id);

-- Create policy for property owners to insert new properties
CREATE POLICY "Property owners can insert properties" ON properties
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Keep other tables secure (these should require authentication)
-- user_profiles, booking_requests, reservations, property_owners remain protected

-- Test the policy
SELECT 'Policy Test' as test_section, id, title, price, address 
FROM properties 
LIMIT 3;