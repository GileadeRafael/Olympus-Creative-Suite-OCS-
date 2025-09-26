import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qrwoboahachmnrfmgnrm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyd29ib2FoYWNobW5yZm1nbnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzc1NzYsImV4cCI6MjA3MzA1MzU3Nn0.t91DYh5gePmNTsJV64Pzlq8YYAwp1ZJzqaHZuHu6cjA";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);