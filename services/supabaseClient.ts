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
// Importa as chaves do arquivo local 'secrets.ts', que está ignorado pelo Git.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../secrets';

// Esta lógica permite que o app funcione tanto localmente (usando secrets.ts)
// quanto em produção na Vercel (usando as Environment Variables).
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;


if (!supabaseUrl || supabaseUrl.startsWith("SUA_URL_SUPABASE_AQUI") || !supabaseAnonKey || supabaseAnonKey.startsWith("SUA_CHAVE_ANON_SUPABASE_AQUI")) {
  throw new Error("As credenciais do Supabase não foram encontradas. Por favor, renomeie o arquivo 'secrets.template.ts' para 'secrets.ts' e adicione suas credenciais.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);