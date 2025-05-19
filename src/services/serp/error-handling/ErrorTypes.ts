
/**
 * Error types for SERP API operations
 */

export enum SerpErrorType {
  // Connection Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Authentication Errors
  INVALID_API_KEY = 'INVALID_API_KEY',
  MISSING_API_KEY = 'MISSING_API_KEY',
  EXPIRED_API_KEY = 'EXPIRED_API_KEY',
  
  // Usage Errors
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  USAGE_QUOTA_EXCEEDED = 'USAGE_QUOTA_EXCEEDED',
  
  // Request Errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_KEYWORD = 'INVALID_KEYWORD',
  UNSUPPORTED_LOCATION = 'UNSUPPORTED_LOCATION',
  
  // Response Errors
  EMPTY_RESPONSE = 'EMPTY_RESPONSE',
  MALFORMED_RESPONSE = 'MALFORMED_RESPONSE',
  
  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR'
}

export interface SerpError {
  type: SerpErrorType;
  message: string;
  provider: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
  retryAfter?: number; // in seconds
}

export class SerpApiError extends Error {
  error: SerpError;
  
  constructor(error: SerpError) {
    super(error.message);
    this.name = 'SerpApiError';
    this.error = error;
  }
}
