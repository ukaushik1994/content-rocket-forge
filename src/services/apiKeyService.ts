
// Re-export all API key functionality from the apiKeys directory for backward compatibility

export * from './apiKeys';

// Re-export with the original name for backward compatibility
export { detectApiKeyTypeSync as detectApiKeyType } from './apiKeys';

