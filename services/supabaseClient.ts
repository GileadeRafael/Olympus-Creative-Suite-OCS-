// FIX: Add global type definitions for import.meta.env for Vite environment variables.
// This is a workaround for environments where tsconfig.json is not correctly configured
// to include 'vite/client' types, which resolves the TypeScript errors.
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
  }
}

import { createClient } from '@supabase/supabase-js';

// This is a Vite project. Client-side environment variables are accessed via `import.meta.env`
// and must be prefixed with `VITE_`.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL (VITE_SUPABASE_URL) and Anon Key (VITE_SUPABASE_ANON_KEY) must be provided in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);