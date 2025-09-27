import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// FIX: Declare the Deno global object to fix TypeScript errors in an environment
// where Deno type definitions are not available. This resolves all TS2339 errors in this file.
declare const Deno: any;

// Get Supabase credentials from environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const caktoWebhookSecret = Deno.env.get('CAKTO_WEBHOOK_SECRET');

if (!supabaseUrl || !supabaseServiceKey || !caktoWebhookSecret) {
  console.error('CRITICAL ERROR: Missing environment variables. Ensure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and CAKTO_WEBHOOK_SECRET are set in your Supabase project settings.');
  Deno.exit(1);
}

// Initialize Supabase client with the service role key for admin-level access
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to create a standard response
const createResponse = (body: object | string, status: number, headers: Headers = new Headers()) => {
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  headers.set('Content-Type', 'application/json');
  return new Response(bodyStr, { status, headers });
};

serve(async (req: Request) => {
  // --- CORS Preflight Request Handling ---
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const corsHeaders = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  // --- Enhanced Debugging: Log all incoming headers ---
  const allHeaders: Record<string, string> = {};
  for (const [key, value] of req.headers.entries()) {
    allHeaders[key] = value;
  }
  console.log('Received all headers:', JSON.stringify(allHeaders, null, 2));


  // --- Security Check: Authorization Header ---
  const authHeader = req.headers.get('Authorization');
  let authorized = false;

  if (authHeader) {
      // Check for standard "Bearer <token>" format
      if (authHeader === `Bearer ${caktoWebhookSecret}`) {
          authorized = true;
      } 
      // Check for raw token format, in case Cakto doesn't add the prefix
      else if (authHeader === caktoWebhookSecret) {
          authorized = true;
      }
  }
  
  if (!authorized) {
      console.warn('Unauthorized webhook attempt. Please check your secret configuration in Cakto and Supabase.', {
          received_header: authHeader ? `"${authHeader}" (length: ${authHeader.length})` : "Header not present",
          expected_secret_start: `Secret starts with: "${caktoWebhookSecret.substring(0, 5)}..."`,
      });
      return createResponse({ error: 'Unauthorized: Invalid or missing token.' }, 401, corsHeaders);
  }
  
  // --- Request Body Parsing ---
  let payload;
  try {
    payload = await req.json();
    console.log('Webhook payload received:', JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error('Error parsing webhook JSON:', error);
    return createResponse({ error: 'Invalid JSON body.' }, 400, corsHeaders);
  }

  // --- Event Filtering ---
  if (payload.event !== 'approved') {
      console.log(`Webhook received, but ignoring event type: '${payload.event}'`);
      return createResponse({ message: `Ignoring event: ${payload.event}`}, 200, corsHeaders);
  }

  // --- Data Extraction ---
  const userId = payload.data?.custom_fields?.user_id;
  const productUrl = payload.data?.product?.checkout_url;

  if (!userId || !productUrl) {
    console.error('Payload missing required fields: user_id or product_url.', { userId, productUrl });
    return createResponse({ error: 'Payload missing required fields: user_id or product_url.' }, 400, corsHeaders);
  }

  // --- Map Product URL to Assistant ID ---
  const ASSISTANT_MAP: Record<string, string> = {
    'https://pay.cakto.com.br/ixeawdp_585985': 'zora',
    'https://pay.cakto.com.br/8m7wamw_585997': 'wizi',
    'https://pay.cakto.com.br/3bdnyhd_586003': 'luma',
    'https://pay.cakto.com.br/44zjs9q_586007': 'loki',
    'https://pay.cakto.com.br/zyruzzx_586010': 'iris',
  };

  const assistantId = ASSISTANT_MAP[productUrl];

  if (!assistantId) {
    console.error(`No assistant found for product URL: ${productUrl}`);
    return createResponse({ error: 'Product URL does not map to a known assistant.' }, 400, corsHeaders);
  }

  // --- Database Operation ---
  try {
    const { error } = await supabaseAdmin
      .from('user_assistants')
      .insert({
        user_id: userId,
        assistant_id: assistantId,
      });

    if (error) {
      // If the user already owns the assistant, it's not a failure.
      if (error.code === '23505') { // PostgreSQL unique_violation code
          console.log(`User ${userId} already owns assistant ${assistantId}. Access is already granted.`);
          return createResponse({ message: 'User already has access to this assistant.' }, 200, corsHeaders);
      }
      throw error; // Re-throw other database errors
    }

    console.log(`SUCCESS: Granted assistant '${assistantId}' to user '${userId}'.`);
    return createResponse({ success: true, message: 'Assistant granted successfully.' }, 200, corsHeaders);

  } catch (error) {
    console.error('Supabase database error:', error);
    return createResponse({ error: 'Internal Server Error: Failed to update user permissions.' }, 500, corsHeaders);
  }
});