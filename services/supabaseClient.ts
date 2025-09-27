// FIX: Standardized environment variable access to use `process.env.VITE_...`,
// resolving the runtime TypeError and ensuring consistency with other services.
declare const process: {
  env: {
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_ANON_KEY?: string;
  };
};

import { createClient } from '@supabase/supabase-js';

// Use process.env, which Vite/Vercel will replace during the build process.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in Vercel environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);