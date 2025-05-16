
// Re-export all API key functionality from the apiKeys directory for backward compatibility

export * from './apiKeys';

// Add a function to decode the Base64 encoded API key
export const decodeApiKey = (encodedKey: string): string => {
  try {
    return atob(encodedKey);
  } catch (error) {
    console.error('Error decoding API key:', error);
    return '';
  }
};
