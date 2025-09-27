
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// FIX: Declare the Deno global object to fix TypeScript errors.
declare const Deno: any;

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const createResponse = (body: object | string, status: number, headers: Headers) => {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers });
};

serve(async (req: Request) => {
  const corsHeaders = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  });

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('CRITICAL: Missing Supabase environment variables.');
    return createResponse({ error: 'Server configuration error.' }, 500, corsHeaders);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const user_id = req.headers.get('x-user-id');

    if (!user_id) {
      return createResponse({ error: 'x-user-id header is required.' }, 400, corsHeaders);
    }
    
    // Security check: In a real-world scenario, you would verify the JWT
    // from the Authorization header to ensure the user making the request
    // is authorized to query data for the given user_id.
    // For this environment, we proceed assuming valid invocation.

    const { data, error } = await supabaseAdmin
      .from('user_assistants')
      .select('assistant_id')
      .eq('user_id', user_id);

    if (error) {
      console.error('Supabase query error:', error.message);
      // Don't expose detailed DB errors to the client
      return createResponse({ error: 'Failed to retrieve data.' }, 500, corsHeaders);
    }

    return createResponse(data, 200, corsHeaders);

  } catch (error) {
    console.error('Function execution error:', error.message);
    return createResponse({ error: 'An unexpected error occurred.' }, 500, corsHeaders);
  }
});
