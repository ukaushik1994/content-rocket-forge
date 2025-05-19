
/**
 * Error handler for SERP API operations
 */
import { SerpApiError } from './ErrorTypes';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { createError } from './error-utils/ErrorFactory';
import { 
  handleNetworkError, 
  processResponse 
} from './error-utils/NetworkErrorHandler';
import { 
  handleApiKeyError, 
  handleRateLimitError, 
  handleQuotaError, 
  handleProviderError 
} from './error-utils/ApiErrorHandler';
import { showErrorNotification } from './error-utils/NotificationUtils';

export class ErrorHandler {
  /**
   * Create a SERP API error
   */
  static createError = createError;
  
  /**
   * Handle a network error
   */
  static handleNetworkError = handleNetworkError;
  
  /**
   * Handle an API key error
   */
  static handleApiKeyError = handleApiKeyError;
  
  /**
   * Handle a rate limit error
   */
  static handleRateLimitError = handleRateLimitError;
  
  /**
   * Handle a usage quota error
   */
  static handleQuotaError = handleQuotaError;
  
  /**
   * Handle a provider-specific error
   */
  static handleProviderError = handleProviderError;
  
  /**
   * Process an HTTP response to determine if it's an error
   */
  static processResponse = processResponse;
  
  /**
   * Handle an error and provide user feedback
   */
  static handleError(error: any, provider: SerpProvider): SerpApiError {
    // If it's already a SerpApiError, return it
    if (error instanceof SerpApiError) {
      return error;
    }
    
    let serpError: SerpApiError;
    
    // Determine error type and create appropriate SerpApiError
    if (error instanceof TypeError && error.message.includes('network')) {
      serpError = this.handleNetworkError(error, provider);
    } else if (error.status === 429 || error.message?.includes('rate limit')) {
      serpError = this.handleRateLimitError(error, provider);
    } else if (error.status === 401 || error.status === 403 || error.message?.includes('key')) {
      serpError = this.handleApiKeyError(error, provider);
    } else if (error.message?.includes('quota')) {
      serpError = this.handleQuotaError(error, provider);
    } else {
      serpError = this.handleProviderError(error, provider);
    }
    
    // Log the error
    console.error(`SERP API Error (${provider}):`, serpError);
    
    // Show toast notification based on error type
    showErrorNotification(serpError);
    
    return serpError;
  }
}

// Re-export all error utility functions for easy access
export { 
  createError,
  handleNetworkError,
  handleApiKeyError,
  handleRateLimitError,
  handleQuotaError,
  handleProviderError,
  processResponse,
  showErrorNotification
};
