// Production-ready Supabase client (no mock mode)
import { createSupabaseClient } from './supabaseApiClient';

// Always use Supabase in production
export const base44 = createSupabaseClient();

// Log connection info for development
if (import.meta.env.DEV) {
  console.log(`🚀 Running in PRODUCTION AUTH mode`);
  console.log(`📊 Connected to Supabase: ${import.meta.env.VITE_SUPABASE_URL}`);
  console.log(`🔒 Mock mode is DISABLED - using real authentication`);
}
