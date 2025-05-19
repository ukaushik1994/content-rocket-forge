
/**
 * API key validation and detection utilities
 */

import { testApiKey } from './testing';

/**
 * Check if a string appears to be DataForSEO credentials in base64 format
 * 
 * @param key - The key to check
 * @returns boolean - Whether the key appears to be in DataForSEO format
 */
export const isDataForSeoFormat = (key: string): boolean => {
  try {
    // Check if it's a valid base64 string
    if (!/^[A-Za-z0-9+/=]+$/.test(key)) return false;
    
    // Try to decode it and check if it has login:password format
    const decoded = atob(key);
    return decoded.includes(':');
  } catch (e) {
    // Not base64 encoded
    return false;
  }
};

/**
 * Encode DataForSEO credentials (login:password) as base64
 * 
 * @param login - The DataForSEO login 
 * @param password - The DataForSEO password
 * @returns string - Base64 encoded credentials
 */
export const encodeDataForSeoCredentials = (login: string, password: string): string => {
  try {
    return btoa(`${login}:${password}`);
  } catch (e) {
    console.error('Error encoding DataForSEO credentials:', e);
    return '';
  }
};

/**
 * Decode DataForSEO credentials from base64
 * 
 * @param encoded - The base64 encoded credentials
 * @returns Object with login and password properties, or null if invalid
 */
export const decodeDataForSeoCredentials = (encoded: string): { login: string; password: string } | null => {
  try {
    const decoded = atob(encoded);
    const [login, password] = decoded.split(':');
    
    if (login && password) {
      return { login, password };
    }
    
    return null;
  } catch (e) {
    console.error('Error decoding DataForSEO credentials:', e);
    return null;
  }
};

/**
 * Detect the type of API key based on its format
 * 
 * @param apiKey - The API key to detect 
 * @returns string | null - The detected service key or null if unknown
 */
export const detectApiKeyType = async (apiKey: string): Promise<string | null> => {
  if (!apiKey) return null;
  
  // Check specific formats
  if (apiKey.startsWith('sk-') && apiKey.length > 20) {
    // Could be OpenAI or Anthropic
    if (apiKey.startsWith('sk-ant-')) {
      return 'anthropic';
    }
    // Try to validate with OpenAI
    try {
      const isValid = await testApiKey('openai', apiKey);
      if (isValid) return 'openai';
    } catch (e) {
      // Not an OpenAI key, continue
    }
  }
  
  // Check if it's a Google API key format
  if (/^AIza[0-9A-Za-z-_]{35}$/.test(apiKey)) {
    return 'gemini';
  }
  
  // Check if it's a SERP API key
  if (apiKey.length === 64 && /^[0-9a-f]{64}$/.test(apiKey)) {
    return 'serpapi';
  }
  
  // Check if it might be DataForSEO credentials
  if (isDataForSeoFormat(apiKey)) {
    return 'dataforseo';
  }
  
  // Unknown format
  return null;
};
