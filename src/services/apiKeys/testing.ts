
import { toast } from 'sonner';

/**
 * Test if an API key is valid
 * @param service - The service to test the key for
 * @param apiKey - The API key to test
 * @returns Promise<boolean> - Whether the key is valid
 */
export const testApiKey = async (service: string, apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  
  try {
    // For DataForSEO, use their specialized testing
    if (service === 'dataforseo') {
      if (!isDataForSeoFormat(apiKey)) {
        toast.error('Invalid DataForSEO credential format');
        return false;
      }
      
      // For browser environment, we don't try to make the actual API call
      // since it needs server-side environment to work properly
      return true;
    }
    
    // For SERP API, check if the key looks valid
    if (service === 'serp') {
      return apiKey.length > 10;
    }
    
    // For OpenAI, check if it's a valid key format
    if (service === 'openai') {
      return apiKey.startsWith('sk-') && apiKey.length > 20;
    }
    
    // For Anthropic, check if it's a valid key format
    if (service === 'anthropic') {
      return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
    }
    
    // For Gemini, just check length for now
    if (service === 'gemini') {
      return apiKey.length > 10;
    }
    
    // Generic check for other services
    return apiKey.length > 8;
  } catch (error) {
    console.error(`Error testing ${service} API key:`, error);
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

/**
 * Encode DataForSEO credentials as base64 JSON
 * 
 * @param login - The DataForSEO login 
 * @param password - The DataForSEO password
 * @returns string - Base64 encoded JSON credentials
 */
export const encodeDataForSeoCredentials = (login: string, password: string): string => {
  try {
    // Create credentials object and encode as base64
    const credentials = JSON.stringify({ login, password });
    return btoa(credentials);
  } catch (e) {
    console.error('Error encoding DataForSEO credentials:', e);
    return '';
  }
};
