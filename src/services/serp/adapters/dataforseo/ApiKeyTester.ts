
/**
 * Utility for testing DataForSEO API keys
 */

// Test endpoint that requires minimal resources but validates authentication
const TEST_ENDPOINT = 'https://api.dataforseo.com/v3/merchant/google/locations';

/**
 * Test if DataForSEO API credentials are valid by making a simple API request
 */
export const testDataForSeoApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  
  try {
    // Check if key has valid format
    if (!isDataForSeoFormat(apiKey)) {
      console.error('Invalid DataForSEO API key format');
      return false;
    }
    
    // Decode the credentials
    const credentials = decodeDataForSeoCredentials(apiKey);
    if (!credentials) {
      console.error('Could not decode DataForSEO credentials');
      return false;
    }
    
    // Create auth header
    const { login, password } = credentials;
    const auth = Buffer.from(`${login}:${password}`).toString('base64');
    
    // Make a test API call to verify the credentials
    const response = await fetch(TEST_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });
    
    // Check if the response is successful
    const isSuccessful = response.ok;
    
    if (!isSuccessful) {
      const errorData = await response.json();
      console.error('DataForSEO API test failed:', errorData);
    }
    
    return isSuccessful;
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
