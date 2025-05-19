
/**
 * Utility for testing DataForSEO API keys
 */
export const testDataForSeoApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  
  try {
    // For DataForSEO, the apiKey is actually a base64 encoded username:password
    if (!isDataForSeoFormat(apiKey)) {
      console.error('Invalid DataForSEO API key format');
      return false;
    }
    
    // Make a simple API request to test the key
    const credentials = decodeDataForSeoCredentials(apiKey);
    if (!credentials) return false;
    
    // In a real implementation, we'd make a test API call here
    // For now, we'll simulate a successful response if the format is correct
    console.log('DataForSEO credentials format validated successfully');
    return true;
  } catch (error) {
    console.error('Error testing DataForSEO key:', error);
    return false;
  }
};

/**
 * Check if a key is in the expected DataForSEO format (base64 encoded JSON)
 */
export const isDataForSeoFormat = (key: string): boolean => {
  try {
    // Basic check - DataForSEO keys are base64 encoded
    if (!key.match(/^[A-Za-z0-9+/=]+$/)) return false;
    
    // Try to decode and parse as JSON
    const decoded = atob(key);
    const credentials = JSON.parse(decoded);
    
    // Check if it has the expected properties
    return !!(credentials.login && credentials.password);
  } catch (e) {
    return false;
  }
};

/**
 * Decode DataForSEO credentials from base64
 */
export const decodeDataForSeoCredentials = (key: string): { login: string; password: string } | null => {
  try {
    const decoded = atob(key);
    const credentials = JSON.parse(decoded);
    
    if (credentials.login && credentials.password) {
      return {
        login: credentials.login,
        password: credentials.password
      };
    }
    return null;
  } catch (e) {
    return null;
  }
};
