import { createClient } from '@base44/sdk';
import { createMockClient } from './mockClient';
import { createSupabaseClient } from './supabaseApiClient';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Use mock mode for local development (can be controlled via .env file)
// Set VITE_USE_MOCK_MODE=false in .env to use Supabase
const USE_MOCK_MODE = import.meta.env.VITE_USE_MOCK_MODE !== 'false';
const APP_ID = import.meta.env.VITE_BASE44_APP_ID || "68fb23ff30bbddd03454f6a2";

// Create a client - Mock, Supabase, or Base44
export const base44 = USE_MOCK_MODE
  ? createMockClient()
  : createSupabaseClient(); // Using Supabase instead of Base44

// Log mode for development
if (import.meta.env.DEV) {
  const mode = USE_MOCK_MODE ? 'MOCK' : 'SUPABASE';
  console.log(`🔧 Running in ${mode} mode`);
  if (!USE_MOCK_MODE) {
    console.log(`📊 Connected to Supabase: ${import.meta.env.VITE_SUPABASE_URL}`);
  }
}
