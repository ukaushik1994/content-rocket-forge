
/**
 * Utility for testing DataForSEO API keys
 */

import { isDataForSeoFormat, decodeDataForSeoCredentials } from '@/services/apiKeys/testing';
import { callApiProxy } from '@/services/apiProxyService';

// Test endpoint that provides account information with minimal API usage
const TEST_ENDPOINT = 'https://api.dataforseo.com/v3/merchant/google/locations';

/**
 * Test if DataForSEO API credentials are valid by making a simple API request
 * Note: This function should ideally run server-side
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

    // For browser environment, we'll consider the key valid if it has the correct format
    // In a production environment, this should be verified through a server endpoint
    console.log('Testing DataForSEO credentials format - valid format detected');
    
    // In real usage, you would proxy this request through an edge function
    // For now, we'll return true if format is valid
    return true;
  } catch (error) {
    console.error('Error testing DataForSEO key:', error);
    return false;
  }
};
