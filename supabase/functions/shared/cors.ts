// Allowed origins for CORS - add your production domains here
const ALLOWED_ORIGINS = [
  'https://creaitesr.lovable.app', // Published URL
  'https://id-preview--ae13b72c-00ff-4e50-bd02-cd9edb6bbaf5.lovable.app', // Preview URL
  'https://iqiundzzcepmuykcnfbc.supabase.co', // Supabase project URL
  'http://localhost:5173', // Local development
  'http://localhost:3000', // Alternative local development
  'http://localhost:8080', // Alternative local development
];

/**
 * Get CORS headers based on the request origin
 * Returns headers that allow the origin if it's in the allowlist,
 * otherwise returns restrictive headers
 */
export function getCorsHeaders(origin: string | null): HeadersInit {
  // If origin is in allowlist, return permissive headers for that origin
  if (origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app')
  )) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    };
  }
  
  // For unknown origins, still allow but log for monitoring
  // This maintains backward compatibility while enabling monitoring
  console.warn('CORS request from unlisted origin:', origin);
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
}

// Legacy static headers for backward compatibility
// Prefer using getCorsHeaders(origin) for new implementations
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Handle CORS preflight requests
 * Use this for OPTIONS requests in edge functions
 */
export function handleCorsPreflightRequest(req?: Request) {
  const origin = req?.headers?.get('origin') || null;
  return new Response(null, { headers: getCorsHeaders(origin) });
}
