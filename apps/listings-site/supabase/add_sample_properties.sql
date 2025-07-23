-- Add sample properties to the database if none exist
-- Run this in your Supabase SQL editor if you don't have any properties

-- First, ensure we have a property owner
INSERT INTO property_owners (email, first_name, last_name, phone)
VALUES ('admin@spaindreamhome.com', 'Admin', 'User', '+34 123 456 789')
ON CONFLICT (email) DO NOTHING;

-- Get the owner ID for the properties
DO $$
DECLARE
    owner_uuid UUID;
BEGIN
    SELECT id INTO owner_uuid FROM property_owners WHERE email = 'admin@spaindreamhome.com' LIMIT 1;
    
    -- Only insert properties if the table is empty
    IF NOT EXISTS (SELECT 1 FROM properties LIMIT 1) THEN
        
        INSERT INTO properties (
            title, description, address, city, price, rooms, bathrooms, size, 
            images, amenities, owner_id, status, type, lat, lng, created_at, updated_at
        ) VALUES 
        (
            'Modern Studio Apartment',
            'Beautiful modern studio in the heart of Madrid, perfect for students. Features modern amenities and excellent transport links.',
            'Calle de Alcalá, 100',
            'Madrid',
            850,
            1,
            1,
            '50',
            ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
            ARRAY['WiFi', 'Air Conditioning', 'Heating', 'Kitchen'],
            owner_uuid,
            'available',
            'Apartment',
            40.4168,
            -3.7038,
            NOW(),
            NOW()
        ),
        (
            'Spacious 2-Bedroom House',
            'Charming house with garden in the prestigious Salamanca district. Perfect for sharing with roommates.',
            'Calle de Serrano, 50',
            'Madrid',
            1200,
            2,
            2,
            '180',
            ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
            ARRAY['Garden', 'Parking', 'WiFi', 'Furnished'],
            owner_uuid,
            'available',
            'House',
            40.4378,
            -3.6848,
            NOW(),
            NOW()
        ),
        (
            'Luxury Condo Downtown',
            'Luxury condominium with stunning city views and premium amenities. Located in the heart of Madrid.',
            'Gran Vía, 25',
            'Madrid',
            1500,
            3,
            2,
            '150',
            ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
            ARRAY['City View', 'Balcony', 'Elevator', 'Security'],
            owner_uuid,
            'available',
            'Condo',
            40.4200,
            -3.7066,
            NOW(),
            NOW()
        ),
        (
            'Cozy Townhouse Near Universities',
            'Perfect for students! Close to major universities with easy access to public transportation.',
            'Calle de Fuencarral, 80',
            'Madrid',
            950,
            2,
            1,
            '120',
            ARRAY['https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&q=80'],
            ARRAY['Near University', 'Public Transport', 'WiFi', 'Study Area'],
            owner_uuid,
            'available',
            'Townhouse',
            40.4267,
            -3.7038,
            NOW(),
            NOW()
        ),
        (
            'Elegant Villa with Pool',
            'Stunning villa with private pool and garden. Ideal for group living with luxury amenities.',
            'Calle de la Princesa, 15',
            'Madrid',
            2000,
            4,
            3,
            '250',
            ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'],
            ARRAY['Pool', 'Garden', 'Parking', 'Luxury Finishes'],
            owner_uuid,
            'available',
            'Villa',
            40.4378,
            -3.7128,
            NOW(),
            NOW()
        ),
        (
            'Student Apartment Complex',
            'Modern apartment complex designed specifically for students. Includes study areas and common spaces.',
            'Calle de Atocha, 45',
            'Madrid',
            750,
            1,
            1,
            '45',
            ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
            ARRAY['Student Housing', 'Study Areas', 'Common Spaces', 'WiFi'],
            owner_uuid,
            'available',
            'Apartment',
            40.4086,
            -3.6922,
            NOW(),
            NOW()
        ),
        (
            'Retiro Park Apartment',
            'Beautiful apartment overlooking Retiro Park. Quiet location with excellent amenities.',
            'Calle de Alfonso XII, 28',
            'Madrid',
            1100,
            2,
            1,
            '85',
            ARRAY['https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80'],
            ARRAY['Park View', 'Quiet Location', 'WiFi', 'Balcony'],
            owner_uuid,
            'available',
            'Apartment',
            40.4152,
            -3.6844,
            NOW(),
            NOW()
        ),
        (
            'Modern Malasaña Loft',
            'Trendy loft in the vibrant Malasaña neighborhood. Perfect for young professionals and students.',
            'Calle de San Bernardo, 60',
            'Madrid',
            1350,
            2,
            2,
            '90',
            ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'],
            ARRAY['Trendy Area', 'Loft Style', 'Modern', 'Near Nightlife'],
            owner_uuid,
            'available',
            'Apartment',
            40.4267,
            -3.7092,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Added 8 sample properties to the database';
    ELSE
        RAISE NOTICE 'Properties already exist in the database, skipping sample data insertion';
    END IF;
END $$;