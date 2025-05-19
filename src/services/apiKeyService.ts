
// Re-export all API key functionality from the apiKeys directory for backward compatibility

export * from './apiKeys';

// Export the DataForSEO and key detection functions explicitly
export { 
  encodeDataForSeoCredentials,
  decodeDataForSeoCredentials,
  isDataForSeoFormat,
  detectApiKeyType
} from './apiKeys/validation';

