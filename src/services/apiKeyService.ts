
/**
 * API Key Management Service
 */

// Import DataForSEO utility functions
import { 
  isDataForSeoFormat as isDataForSeoFormatUtil, 
  decodeDataForSeoCredentials as decodeDataForSeoCredentialsUtil 
} from './serp/adapters/dataforseo/ApiKeyTester';

/**
 * Get an API key from storage
 */
export const getApiKey = async (service: string): Promise<string | null> => {
  // For now, we'll use localStorage
  return localStorage.getItem(`${service}_api_key`);
};

/**
 * Save an API key to storage
 */
export const saveApiKey = async (service: string, apiKey: string): Promise<boolean> => {
  try {
    localStorage.setItem(`${service}_api_key`, apiKey);
    return true;
  } catch (error) {
    console.error(`Error saving ${service} API key:`, error);
    return false;
  }
};

/**
 * Delete an API key from storage
 */
export const deleteApiKey = async (service: string): Promise<boolean> => {
  try {
    localStorage.removeItem(`${service}_api_key`);
    return true;
  } catch (error) {
    console.error(`Error deleting ${service} API key:`, error);
    return false;
  }
};

/**
 * Test if an API key is valid
 */
export const testApiKey = async (service: string, apiKey: string): Promise<boolean> => {
  // Import dynamically to avoid circular dependencies
  const { testApiKey: testApiKeyImpl } = await import('./apiKeys/testing');
  return testApiKeyImpl(service, apiKey);
};

/**
 * Check if a string is in DataForSEO format
 */
export const isDataForSeoFormat = isDataForSeoFormatUtil;

/**
 * Decode DataForSEO credentials
 */
export const decodeDataForSeoCredentials = decodeDataForSeoCredentialsUtil;

/**
 * Encode DataForSEO credentials
 */
export const encodeDataForSeoCredentials = (login: string, password: string): string => {
  try {
    const credentials = { login, password };
    return btoa(JSON.stringify(credentials));
  } catch (error) {
    console.error('Error encoding DataForSEO credentials:', error);
    return '';
  }
};

// Add type for DataForSEO credentials
export interface DataForSeoCredentials {
  login: string;
  password: string;
}
