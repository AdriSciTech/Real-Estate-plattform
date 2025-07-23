// app/lib/supabase-client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create client function that works on both server and client
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables not found:', {
      url: !!supabaseUrl,
      key: !!supabaseKey,
      isServer: typeof window === 'undefined'
    });
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
};