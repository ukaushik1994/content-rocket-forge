
/**
 * Factory for creating SERP API errors
 */
import { SerpApiError, SerpApiErrorDetails, SerpErrorType } from '../ErrorTypes';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';

/**
 * Create a SERP API error
 */
export const createError = (
  type: SerpErrorType,
  message: string,
  provider: SerpProvider,
  details?: any,
  recoverable: boolean = false,
  retryAfter?: number
): SerpApiError => {
  const errorDetails: SerpApiErrorDetails = {
    type,
    message,
    provider,
    details,
    timestamp: new Date(),
    recoverable,
    retryAfter
  };
  
  return new SerpApiError(errorDetails);
};
