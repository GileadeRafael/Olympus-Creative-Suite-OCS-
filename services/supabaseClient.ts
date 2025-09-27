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
import { LOCAL_SUPABASE_URL, LOCAL_SUPABASE_ANON_KEY } from '../config';

// This logic makes the app work seamlessly in both local and production (Vercel) environments.
// It prioritizes Vercel's environment variables but falls back to your local config file.
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || LOCAL_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || LOCAL_SUPABASE_ANON_KEY;


if (!supabaseUrl || supabaseUrl === "COLE_SUA_URL_SUPABASE_AQUI" || !supabaseAnonKey || supabaseAnonKey === "COLE_SUA_CHAVE_ANON_SUPABASE_AQUI") {
  throw new Error('As credenciais do Supabase não foram encontradas. Por favor, adicione-as ao arquivo "config.ts".');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);