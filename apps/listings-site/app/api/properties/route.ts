// app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Property } from '@rental/types'
import { createServerClient } from '@rental/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Properties API called at:', new Date().toISOString())

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined
    const beds = searchParams.get('beds') ? parseInt(searchParams.get('beds')!) : undefined
    const baths = searchParams.get('baths') ? parseInt(searchParams.get('baths')!) : undefined
    const location = searchParams.get('location') || undefined
    const type = searchParams.get('type') || undefined

    // Query Supabase database
    const supabase = createServerClient()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (minPrice) {
      query = query.gte('price', minPrice)
    }
    if (maxPrice) {
      query = query.lte('price', maxPrice)
    }
    if (beds) {
      query = query.gte('rooms', beds)
    }
    if (baths) {
      query = query.gte('bathrooms', baths)
    }
    if (location) {
      query = query.or(`address.ilike.%${location}%,city.ilike.%${location}%,description.ilike.%${location}%`)
    }
    if (type) {
      query = query.eq('type', type)
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit - 1
    query = query.range(startIndex, endIndex)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase query error:', error)
      console.log('Falling back to sample data due to database error')
      
      // Return sample data if database query fails
      const sampleProperties: Property[] = [
        {
          id: '1',
          title: 'Modern Studio Apartment',
          type: 'Apartment',
          price: 850,
          beds: 1,
          baths: 1,
          area: 50,
          address: 'Calle de Alcalá, 100, Madrid, Spain',
          description: 'Beautiful modern studio in the heart of Madrid, perfect for students.',
          image_urls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
          lat: 40.4168,
          lng: -3.7038,
          available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Spacious 2-Bedroom House',
          type: 'House',
          price: 1200,
          beds: 2,
          baths: 2,
          area: 180,
          address: 'Calle de Serrano, 50, Madrid, Spain',
          description: 'Charming house with garden in the prestigious Salamanca district.',
          image_urls: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
          lat: 40.4378,
          lng: -3.6848,
          available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return NextResponse.json({
        success: true,
        properties: sampleProperties,
        total: sampleProperties.length,
        page: 1,
        totalPages: 1,
        message: 'Sample properties (database connection failed)',
        fallback: true
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
    }

    // If no data from database, return sample properties
    if (!data || data.length === 0) {
      const sampleProperties: Property[] = [
        {
          id: '1',
          title: 'Modern Studio Apartment',
          type: 'Apartment',
          price: 850,
          beds: 1,
          baths: 1,
          area: 50,
          address: 'Calle de Alcalá, 100, Madrid, Spain',
          description: 'Beautiful modern studio in the heart of Madrid, perfect for students.',
          image_urls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
          lat: 40.4168,
          lng: -3.7038,
          available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2', 
          title: 'Spacious 2-Bedroom House',
          type: 'House',
          price: 1200,
          beds: 2,
          baths: 2,
          area: 180,
          address: 'Calle de Serrano, 50, Madrid, Spain',
          description: 'Charming house with garden in the prestigious Salamanca district.',
          image_urls: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
          lat: 40.4378,
          lng: -3.6848,
          available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Luxury Condo Downtown',
          type: 'Condo', 
          price: 1500,
          beds: 3,
          baths: 2,
          area: 150,
          address: 'Gran Vía, 25, Madrid, Spain',
          description: 'Luxury condominium with stunning city views and premium amenities.',
          image_urls: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
          lat: 40.4200,
          lng: -3.7066,
          available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      console.log('Database is empty, returning sample properties')
      
      return NextResponse.json({
        success: true,
        properties: sampleProperties,
        total: sampleProperties.length,
        page,
        totalPages: 1,
        message: 'Sample properties (database empty)',
        fallback: true
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60'
        }
      })
    }

    // Transform data to match expected Property interface with safe type conversion
    const properties: Property[] = (data || []).map((property: any): Property => {
      return {
        id: property.id || '',
        title: property.title || 'Untitled Property',
        type: property.type || 'Apartment',
        price: property.price || 0,
        beds: property.rooms || property.beds || 1,
        baths: property.bathrooms || property.baths || 1,
        area: property.size ? parseInt(property.size) : property.area,
        address: property.address || '',
        description: property.description || '',
        image_urls: Array.isArray(property.images) ? property.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
        lat: property.lat || 40.4168,
        lng: property.lng || -3.7038,
        available: property.status === 'available' || property.available === true,
        created_at: property.created_at || '',
        updated_at: property.updated_at || ''
      }
    })

    console.log(`Returning ${properties.length} properties from database`)

    return NextResponse.json({
      success: true,
      properties,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      message: 'Properties fetched successfully'
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
      }
    })

  } catch (error) {
    console.error('Error in properties API:', error)
    
    return NextResponse.json({
      success: false,
      properties: [],
      total: 0,
      message: 'Failed to fetch properties',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500
    })
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
