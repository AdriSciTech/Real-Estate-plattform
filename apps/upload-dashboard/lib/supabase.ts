//my-app\lib\supabase.ts

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Store the client instance
let supabaseClient: SupabaseClient | null = null;

// Create client function that handles environment variables safely
export const createClient = () => {
  // Only run on client side
  if (typeof window === 'undefined') {
    return null;
  }

  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables not found:', {
      url: !!supabaseUrl,
      key: !!supabaseKey
    });
    return null;
  }

  // Create and store the client instance
  supabaseClient = createSupabaseClient(supabaseUrl, supabaseKey);
  
  return supabaseClient;
};

// Optional: Reset function for testing or when you need to force recreate the client
export const resetSupabaseClient = () => {
  supabaseClient = null;
};