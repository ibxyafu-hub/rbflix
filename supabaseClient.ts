import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { API_CONFIG } from '../config/api.config';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns the initialized Supabase client if URL and Anon key are provided.
 * Uses only the public/anon browser key. Never uses service_role.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = API_CONFIG;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseInstance;
  }

  return null;
}

export const supabase = getSupabaseClient();
