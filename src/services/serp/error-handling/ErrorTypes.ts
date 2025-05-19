
/**
 * Types of errors that can occur in SERP API service
 */
export enum SerpErrorType {
  // API errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  
  // Request/response errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  
  // General errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Miscellaneous
  FETCHING_ERROR = 'FETCHING_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Interface for SERP API error details
 */
export interface SerpApiErrorDetails {
  type: SerpErrorType;
  message: string;
  provider: string;
  timestamp: Date;
  recoverable: boolean;
  details?: any;
}

/**
 * Custom error class for SERP API errors
 */
export class SerpApiError extends Error {
  type: SerpErrorType;
  provider: string;
  timestamp: Date;
  recoverable: boolean;
  details?: any;
  
  constructor(details: SerpApiErrorDetails) {
    super(details.message);
    this.name = 'SerpApiError';
    this.type = details.type;
    this.provider = details.provider;
    this.timestamp = details.timestamp;
    this.recoverable = details.recoverable;
    this.details = details.details;
    
    // Needed for proper error inheritance in TypeScript
    Object.setPrototypeOf(this, SerpApiError.prototype);
  }
}
