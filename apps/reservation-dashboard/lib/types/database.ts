export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      booking_requests: {
        Row: {
          id: string
          user_id: string
          property_id: string
          start_date: string
          end_date: string
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          message: string | null
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          start_date: string
          end_date: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          message?: string | null
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          start_date?: string
          end_date?: string
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          message?: string | null
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string
          address: string
          city: string
          price: number
          rooms: number
          bathrooms: number
          size: string | null
          images: string[]
          amenities: string[]
          owner_id: string
          status: 'available' | 'reserved' | 'occupied'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          address: string
          city: string
          price: number
          rooms: number
          bathrooms: number
          size?: string | null
          images?: string[]
          amenities?: string[]
          owner_id: string
          status?: 'available' | 'reserved' | 'occupied'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          address?: string
          city?: string
          price?: number
          rooms?: number
          bathrooms?: number
          size?: string | null
          images?: string[]
          amenities?: string[]
          owner_id?: string
          status?: 'available' | 'reserved' | 'occupied'
          created_at?: string
          updated_at?: string
        }
      }
      property_owners: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          properties: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          properties?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          properties?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          property_id: string
          booking_request_id: string
          start_date: string
          end_date: string
          status?: 'active' | 'completed' | 'cancelled'
          contract_signed?: boolean
          payment_status?: 'pending' | 'paid' | 'refunded'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          booking_request_id?: string
          start_date?: string
          end_date?: string
          status?: 'active' | 'completed' | 'cancelled'
          contract_signed?: boolean
          payment_status?: 'pending' | 'paid' | 'refunded'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}