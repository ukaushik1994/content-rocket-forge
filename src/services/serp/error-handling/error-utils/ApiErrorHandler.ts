
/**
 * Handler for API-related errors
 */
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { SerpApiError, SerpErrorType } from '../ErrorTypes';
import { createError } from './ErrorFactory';

/**
 * Handle an API key error
 */
export const handleApiKeyError = (
  error: any,
  provider: SerpProvider
): SerpApiError => {
  const status = error.status || error.statusCode || error.code;
  
  // Handle specific API key errors based on status codes or messages
  if (
    status === 401 || 
    status === 403 || 
    error.message?.includes('unauthorized') ||
    error.message?.includes('forbidden') ||
    error.message?.includes('invalid key') ||
    error.message?.includes('invalid api key')
  ) {
    return createError(
      SerpErrorType.INVALID_API_KEY,
      `Invalid API key for ${provider}`,
      provider,
      error,
      false // Not recoverable, requires user action
    );
  }
  
  if (error.message?.includes('expired')) {
    return createError(
      SerpErrorType.EXPIRED_API_KEY,
      `Your ${provider} API key has expired`,
      provider,
      error,
      false // Not recoverable, requires user action
    );
  }
  
  // Default to unknown API key error
  return createError(
    SerpErrorType.INVALID_API_KEY,
    `API key error for ${provider}`,
    provider,
    error,
    false // Not recoverable, requires user action
  );
};

/**
 * Handle a rate limit error
 */
export const handleRateLimitError = (
  error: any,
  provider: SerpProvider,
  retryAfter?: number
): SerpApiError => {
  return createError(
    SerpErrorType.RATE_LIMIT_EXCEEDED,
    `Rate limit exceeded for ${provider}`,
    provider,
    error,
    true, // Recoverable
    retryAfter || 60 // Default to 60 seconds if not specified
  );
};

/**
 * Handle a usage quota error
 */
export const handleQuotaError = (
  error: any,
  provider: SerpProvider
): SerpApiError => {
  return createError(
    SerpErrorType.USAGE_QUOTA_EXCEEDED,
    `Usage quota exceeded for ${provider}`,
    provider,
    error,
    false // Not recoverable, requires user action
  );
};

/**
 * Handle a provider-specific error
 */
export const handleProviderError = (
  error: any,
  provider: SerpProvider,
  message?: string
): SerpApiError => {
  return createError(
    SerpErrorType.PROVIDER_ERROR,
    message || `Error from ${provider} API`,
    provider,
    error,
    false // Assume not recoverable by default
  );
};
