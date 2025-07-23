// packages/supabase/src/client.ts - Main client creation and management
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton instances to prevent multiple client creation
let clientInstance: SupabaseClient | null = null;
let serverInstance: SupabaseClient | null = null;

// Enhanced configuration interface
interface SupabaseConfig {
  auth?: {
    persistSession?: boolean;
    autoRefreshToken?: boolean;
    detectSessionInUrl?: boolean;
  };
  headers?: Record<string, string>;
}

// Create client function that handles environment variables safely
export const createClient = (config: SupabaseConfig = {}) => {
  // Return existing instance if available
  if (clientInstance) {
    return clientInstance;
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

  try {
    clientInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined',
        ...config.auth
      },
      global: {
        headers: {
          'x-client-info': 'rental-platform@1.0.0',
          ...config.headers
        }
      }
    });
    
    return clientInstance;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
};

// For server-side usage - enhanced with better error handling
export const createServerClient = (config: SupabaseConfig = {}) => {
  // Return existing server instance if available
  if (serverInstance) {
    return serverInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not found for server client');
    return null;
  }

  try {
    serverInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        ...config.auth
      },
      global: {
        headers: {
          'x-client-info': 'rental-platform-server@1.0.0',
          ...config.headers
        }
      }
    });

    return serverInstance;
  } catch (error) {
    console.error('Failed to create Supabase server client:', error);
    return null;
  }
};

// Reset instances (useful for testing or hot reload)
export const resetClientInstances = () => {
  clientInstance = null;
  serverInstance = null;
};

// Legacy compatibility - export the simpler version for upload dashboard
export const resetSupabaseClient = resetClientInstances;

// Export types for easier importing
export type { SupabaseClient };
export type SupabaseResponse<T> = {
  data: T | null;
  error: any;
  count?: number;
};

// Default export for convenience
export default createClient;