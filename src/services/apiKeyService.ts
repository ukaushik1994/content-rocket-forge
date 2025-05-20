
/**
 * API key management service
 * This is the main service for interacting with API keys
 */

// Re-export everything from storage for backwards compatibility
export * from './apiKeys/storage';

// Re-export testing functions
export {
  testApiKey,
  decodeDataForSeoCredentials,
  encodeDataForSeoCredentials
} from './apiKeys/testing';

// Re-export validation functions, but exclude isDataForSeoFormat which is also in testing
export {
  detectApiKeyType,
  validateApiKeyFormat
} from './apiKeys/validation';

// Re-export encryption functions
export * from './apiKeys/encryption';

// Re-export types
export * from './apiKeys/types';
