import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Type definitions for our database entities
export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface BookingRequest {
  id: string
  user_id: string
  property_id: string
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  message?: string
  total_amount: number
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  title: string
  description: string
  address: string
  city: string
  price: number
  rooms: number
  bathrooms: number
  size?: string
  images: string[]
  amenities: string[]
  owner_id: string
  status: 'available' | 'reserved' | 'occupied'
  created_at: string
  updated_at: string
}

export interface PropertyOwner {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  properties: string[]
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  user_id: string
  property_id: string
  booking_request_id: string
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'cancelled'
  contract_signed: boolean
  payment_status: 'pending' | 'paid' | 'refunded'
  created_at: string
  updated_at: string
}

// Helper functions for common operations
export const auth = {
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password })
  },
  
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  },
  
  signOut: async () => {
    return await supabase.auth.signOut()
  },
  
  getSession: async () => {
    return await supabase.auth.getSession()
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // User profiles
  getUserProfile: async (userId: string) => {
    return await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
  },
  
  updateUserProfile: async (userId: string, data: Partial<UserProfile>) => {
    return await supabase
      .from('user_profiles')
      .update(data)
      .eq('id', userId)
  },
  
  createUserProfile: async (data: Omit<UserProfile, 'created_at' | 'updated_at'>) => {
    return await supabase
      .from('user_profiles')
      .insert(data)
  },
  
  // Booking requests
  getBookingRequests: async (userId: string) => {
    return await supabase
      .from('booking_requests')
      .select('*, properties(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },
  
  createBookingRequest: async (data: Omit<BookingRequest, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase
      .from('booking_requests')
      .insert(data)
  },
  
  updateBookingRequest: async (id: string, data: Partial<BookingRequest>) => {
    return await supabase
      .from('booking_requests')
      .update(data)
      .eq('id', id)
  },
  
  // Properties
  getProperties: async () => {
    return await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
  },
  
  getProperty: async (id: string) => {
    return await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()
  },
  
  updateProperty: async (id: string, data: Partial<Property>) => {
    return await supabase
      .from('properties')
      .update(data)
      .eq('id', id)
  },
  
  // Property owners
  getPropertyOwners: async () => {
    return await supabase
      .from('property_owners')
      .select('*')
      .order('created_at', { ascending: false })
  },
  
  getPropertyOwner: async (id: string) => {
    return await supabase
      .from('property_owners')
      .select('*')
      .eq('id', id)
      .single()
  },
  
  createPropertyOwner: async (data: Omit<PropertyOwner, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase
      .from('property_owners')
      .insert(data)
  },
  
  updatePropertyOwner: async (id: string, data: Partial<PropertyOwner>) => {
    return await supabase
      .from('property_owners')
      .update(data)
      .eq('id', id)
  },
  
  // Reservations
  getReservations: async (userId: string) => {
    return await supabase
      .from('reservations')
      .select('*, properties(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },
  
  createReservation: async (data: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
    return await supabase
      .from('reservations')
      .insert(data)
  },
  
  updateReservation: async (id: string, data: Partial<Reservation>) => {
    return await supabase
      .from('reservations')
      .update(data)
      .eq('id', id)
  }
}