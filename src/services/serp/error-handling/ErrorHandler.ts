
/**
 * Error handler for SERP API operations
 */

import { SerpApiError, SerpError, SerpErrorType } from './ErrorTypes';
import { toast } from 'sonner';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';

export class ErrorHandler {
  /**
   * Create a SERP API error
   */
  static createError(
    type: SerpErrorType,
    message: string,
    provider: SerpProvider,
    details?: any,
    recoverable: boolean = false,
    retryAfter?: number
  ): SerpApiError {
    const error: SerpError = {
      type,
      message,
      provider,
      details,
      timestamp: new Date(),
      recoverable,
      retryAfter
    };
    
    return new SerpApiError(error);
  }
  
  /**
   * Handle a network error
   */
  static handleNetworkError(
    error: any, 
    provider: SerpProvider
  ): SerpApiError {
    // Determine if it's a timeout
    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return this.createError(
        SerpErrorType.TIMEOUT_ERROR,
        `Connection timed out while contacting ${provider}`,
        provider,
        error,
        true // Recoverable
      );
    }
    
    // General network error
    return this.createError(
      SerpErrorType.NETWORK_ERROR,
      `Failed to connect to ${provider}`,
      provider,
      error,
      true // Recoverable
    );
  }
  
  /**
   * Handle an API key error
   */
  static handleApiKeyError(
    error: any,
    provider: SerpProvider
  ): SerpApiError {
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
      return this.createError(
        SerpErrorType.INVALID_API_KEY,
        `Invalid API key for ${provider}`,
        provider,
        error,
        false // Not recoverable, requires user action
      );
    }
    
    if (error.message?.includes('expired')) {
      return this.createError(
        SerpErrorType.EXPIRED_API_KEY,
        `Your ${provider} API key has expired`,
        provider,
        error,
        false // Not recoverable, requires user action
      );
    }
    
    // Default to unknown API key error
    return this.createError(
      SerpErrorType.INVALID_API_KEY,
      `API key error for ${provider}`,
      provider,
      error,
      false // Not recoverable, requires user action
    );
  }
  
  /**
   * Handle a rate limit error
   */
  static handleRateLimitError(
    error: any,
    provider: SerpProvider,
    retryAfter?: number
  ): SerpApiError {
    return this.createError(
      SerpErrorType.RATE_LIMIT_EXCEEDED,
      `Rate limit exceeded for ${provider}`,
      provider,
      error,
      true, // Recoverable
      retryAfter || 60 // Default to 60 seconds if not specified
    );
  }
  
  /**
   * Handle a usage quota error
   */
  static handleQuotaError(
    error: any,
    provider: SerpProvider
  ): SerpApiError {
    return this.createError(
      SerpErrorType.USAGE_QUOTA_EXCEEDED,
      `Usage quota exceeded for ${provider}`,
      provider,
      error,
      false // Not recoverable, requires user action
    );
  }
  
  /**
   * Handle a provider-specific error
   */
  static handleProviderError(
    error: any,
    provider: SerpProvider,
    message?: string
  ): SerpApiError {
    return this.createError(
      SerpErrorType.PROVIDER_ERROR,
      message || `Error from ${provider} API`,
      provider,
      error,
      false // Assume not recoverable by default
    );
  }
  
  /**
   * Process an HTTP response to determine if it's an error
   */
  static async processResponse(
    response: Response,
    provider: SerpProvider
  ): Promise<any> {
    if (!response.ok) {
      // Check for rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
        throw this.handleRateLimitError(response, provider, retryAfter);
      }
      
      // Check for auth issues
      if (response.status === 401 || response.status === 403) {
        throw this.handleApiKeyError(response, provider);
      }
      
      // Handle other error responses
      try {
        const errorData = await response.json();
        throw this.handleProviderError(errorData, provider, errorData.message || `HTTP error ${response.status}`);
      } catch (e) {
        // If we can't parse the error response
        throw this.handleProviderError(response, provider, `HTTP error ${response.status}`);
      }
    }
    
    // Response is OK, parse JSON
    try {
      return await response.json();
    } catch (e) {
      throw this.createError(
        SerpErrorType.MALFORMED_RESPONSE,
        `Invalid JSON response from ${provider}`,
        provider,
        e,
        false
      );
    }
  }
  
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
    this.showErrorNotification(serpError);
    
    return serpError;
  }
  
  /**
   * Show a toast notification for an error
   */
  private static showErrorNotification(error: SerpApiError): void {
    const { type, message, provider, recoverable } = error.error;
    
    switch (type) {
      case SerpErrorType.INVALID_API_KEY:
      case SerpErrorType.EXPIRED_API_KEY:
      case SerpErrorType.MISSING_API_KEY:
        toast.error(message, {
          duration: 5000,
          action: {
            label: 'Settings',
            onClick: () => {
              window.location.href = '/settings/api';
            }
          }
        });
        break;
        
      case SerpErrorType.RATE_LIMIT_EXCEEDED:
        toast.error(`${message}. Try again in ${error.error.retryAfter || 60} seconds.`);
        break;
        
      case SerpErrorType.USAGE_QUOTA_EXCEEDED:
        toast.error(`${message}. Please upgrade your plan or try again tomorrow.`, {
          duration: 5000
        });
        break;
        
      case SerpErrorType.NETWORK_ERROR:
      case SerpErrorType.TIMEOUT_ERROR:
        toast.error(message, {
          description: 'Check your internet connection and try again.',
          duration: 5000
        });
        break;
        
      default:
        toast.error(message, { duration: 5000 });
    }
  }
}
