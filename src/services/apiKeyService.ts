
/**
 * API key management service
 */

// Export the functions from your testing module
export { 
  testApiKey, 
  isDataForSeoFormat,
  decodeDataForSeoCredentials
} from './apiKeys/testing';

/**
 * Save an API key to storage (localStorage for now)
 * 
 * @param service - The service identifier
 * @param apiKey - The API key to save
 * @returns Promise<boolean> - Whether the save was successful
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
 * Get an API key from storage
 * 
 * @param service - The service identifier
 * @returns Promise<string | null> - The API key if found, or null
 */
export const getApiKey = async (service: string): Promise<string | null> => {
  try {
    return localStorage.getItem(`${service}_api_key`);
  } catch (error) {
    console.error(`Error getting ${service} API key:`, error);
    return null;
  }
};

/**
 * Delete an API key from storage
 * 
 * @param service - The service identifier
 * @returns Promise<boolean> - Whether the deletion was successful
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
 * Encode DataForSEO credentials as base64
 */
export const encodeDataForSeoCredentials = (login: string, password: string): string => {
  const credentials = JSON.stringify({ login, password });
  return btoa(credentials);
};

/**
 * Check if an API key exists
 * 
 * @param service - The service identifier
 * @returns boolean - Whether the key exists
 */
export const apiKeyExists = (service: string): boolean => {
  return !!localStorage.getItem(`${service}_api_key`);
};
