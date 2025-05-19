
/**
 * Handler for network-related errors
 */
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { SerpApiError, SerpErrorType } from '../ErrorTypes';
import { createError } from './ErrorFactory';

/**
 * Handle a network error
 */
export const handleNetworkError = (
  error: any, 
  provider: SerpProvider
): SerpApiError => {
  // Determine if it's a timeout
  if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
    return createError(
      SerpErrorType.TIMEOUT_ERROR,
      `Connection timed out while contacting ${provider}`,
      provider,
      error,
      true // Recoverable
    );
  }
  
  // General network error
  return createError(
    SerpErrorType.NETWORK_ERROR,
    `Failed to connect to ${provider}`,
    provider,
    error,
    true // Recoverable
  );
};

/**
 * Process an HTTP response to determine if it's an error
 */
export const processResponse = async (
  response: Response,
  provider: SerpProvider
): Promise<any> => {
  if (!response.ok) {
    // Check for rate limiting
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
      throw handleRateLimitError(response, provider, retryAfter);
    }
    
    // Check for auth issues
    if (response.status === 401 || response.status === 403) {
      throw handleApiKeyError(response, provider);
    }
    
    // Handle other error responses
    try {
      const errorData = await response.json();
      throw handleProviderError(errorData, provider, errorData.message || `HTTP error ${response.status}`);
    } catch (e) {
      // If we can't parse the error response
      throw handleProviderError(response, provider, `HTTP error ${response.status}`);
    }
  }
  
  // Response is OK, parse JSON
  try {
    return await response.json();
  } catch (e) {
    throw createError(
      SerpErrorType.MALFORMED_RESPONSE,
      `Invalid JSON response from ${provider}`,
      provider,
      e,
      false
    );
  }
};

// Import these functions to avoid circular dependencies
import { handleRateLimitError, handleApiKeyError, handleProviderError } from './ApiErrorHandler';
