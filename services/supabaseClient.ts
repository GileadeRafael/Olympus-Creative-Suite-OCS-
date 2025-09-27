// This is a Vite project. Environment variables are typically accessed via `import.meta.env`.
// However, to resolve TypeScript errors related to missing Vite client types, we are using `process.env`.

import { createClient } from '@supabase/supabase-js';

// FIX: Switched from `import.meta.env` to `process.env` to resolve TypeScript errors.
// This assumes the environment is configured to expose these variables.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL (VITE_SUPABASE_URL) and Anon Key (VITE_SUPABASE_ANON_KEY) must be provided in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);