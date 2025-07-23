-- Migration script to add reservation system tables and columns to existing schema
-- Run this in your Supabase SQL editor

-- First, create the missing tables that are needed for the reservation system

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_owners table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    properties TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add owner_id column to existing properties table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'owner_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE properties ADD COLUMN owner_id UUID REFERENCES property_owners(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
    END IF;
END $$;

-- Add status column to properties table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE properties ADD COLUMN status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'occupied'));
        CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
    END IF;
END $$;

-- Create booking_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS booking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    message TEXT,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    email_preview_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations table if it doesn't exist
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    booking_request_id UUID REFERENCES booking_requests(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    contract_signed BOOLEAN DEFAULT FALSE,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_property_owners_email ON property_owners(email);
CREATE INDEX IF NOT EXISTS idx_booking_requests_user_id ON booking_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_property_id ON booking_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_property_id ON reservations(property_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_user_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_user_profiles_updated_at 
            BEFORE UPDATE ON user_profiles 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_property_owners_updated_at'
    ) THEN
        CREATE TRIGGER update_property_owners_updated_at 
            BEFORE UPDATE ON property_owners 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_booking_requests_updated_at'
    ) THEN
        CREATE TRIGGER update_booking_requests_updated_at 
            BEFORE UPDATE ON booking_requests 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_reservations_updated_at'
    ) THEN
        CREATE TRIGGER update_reservations_updated_at 
            BEFORE UPDATE ON reservations 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can only see/edit their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Property owners can see their own data
DROP POLICY IF EXISTS "Property owners can view own data" ON property_owners;
CREATE POLICY "Property owners can view own data" ON property_owners
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Property owners can update own data" ON property_owners;
CREATE POLICY "Property owners can update own data" ON property_owners
    FOR UPDATE USING (auth.uid() = id);

-- Properties are viewable by all authenticated users
DROP POLICY IF EXISTS "Properties are viewable by authenticated users" ON properties;
CREATE POLICY "Properties are viewable by authenticated users" ON properties
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Property owners can update own properties" ON properties;
CREATE POLICY "Property owners can update own properties" ON properties
    FOR UPDATE USING (auth.uid() = owner_id);

-- Booking requests policies
DROP POLICY IF EXISTS "Users can view own booking requests" ON booking_requests;
CREATE POLICY "Users can view own booking requests" ON booking_requests
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create booking requests" ON booking_requests;
CREATE POLICY "Users can create booking requests" ON booking_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own booking requests" ON booking_requests;
CREATE POLICY "Users can update own booking requests" ON booking_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Property owners can view booking requests for their properties
DROP POLICY IF EXISTS "Property owners can view booking requests for their properties" ON booking_requests;
CREATE POLICY "Property owners can view booking requests for their properties" ON booking_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = booking_requests.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Reservations policies
DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;
CREATE POLICY "Users can view own reservations" ON reservations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create reservations" ON reservations;
CREATE POLICY "Users can create reservations" ON reservations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reservations" ON reservations;
CREATE POLICY "Users can update own reservations" ON reservations
    FOR UPDATE USING (auth.uid() = user_id);

-- Create a default property owner for existing properties
INSERT INTO property_owners (email, first_name, last_name, phone)
VALUES ('admin@spaindreamhome.com', 'Admin', 'User', '+34 123 456 789')
ON CONFLICT (email) DO NOTHING;

-- Update existing properties to have the default owner
UPDATE properties 
SET owner_id = (SELECT id FROM property_owners WHERE email = 'admin@spaindreamhome.com' LIMIT 1)
WHERE owner_id IS NULL;