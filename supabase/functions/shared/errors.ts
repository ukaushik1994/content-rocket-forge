
import { corsHeaders } from './cors.ts';

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
  service?: string;
  endpoint?: string;
  timestamp?: string;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  service?: string,
  endpoint?: string
): Response {
  const errorResponse: ErrorResponse = {
    error,
    service,
    endpoint,
    timestamp: new Date().toISOString()
  };

  console.error(`API Error [${service}/${endpoint}]:`, error);
  
  return new Response(
    JSON.stringify(errorResponse),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Create a success response
 */
export function createSuccessResponse(data: any): Response {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
