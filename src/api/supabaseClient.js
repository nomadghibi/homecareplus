import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'careconnect-auth',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'care-connect-pro',
    },
  },
});

// Helper function to handle Supabase errors
export function handleSupabaseError(error) {
  console.error('Supabase Error Details:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
    fullError: error
  });

  if (error.code === 'PGRST116') {
    throw new Error('No data found');
  }

  if (error.code === '23505') {
    throw new Error('Duplicate entry - this record already exists');
  }

  if (error.code === '23503') {
    throw new Error('Related record not found');
  }

  if (error.code === '42703') {
    throw new Error('Invalid column name - database field does not exist');
  }

  throw new Error(error.message || 'An error occurred with the database');
}

// Helper function to format Supabase response
export function formatSupabaseResponse(data, error) {
  if (error) {
    handleSupabaseError(error);
  }
  return data;
}

export default supabase;
