
/**
 * API key validation utilities
 */

export * from './testing';

/**
 * Encode DataForSEO credentials (email and password) into base64 format
 * 
 * @param email - DataForSEO account email
 * @param password - DataForSEO account password
 * @returns string - Base64 encoded credentials
 */
export const encodeDataForSeoCredentials = (email: string, password: string): string => {
  // DataForSEO requires credentials in the format "email:password" encoded in base64
  return btoa(`${email}:${password}`);
};

/**
 * Decode DataForSEO credentials from base64 format
 * 
 * @param encodedCredentials - Base64 encoded credentials
 * @returns object - Object with email and password properties
 */
export const decodeDataForSeoCredentials = (encodedCredentials: string): { email: string, password: string } => {
  try {
    // Decode base64 string to "email:password" format
    const decodedString = atob(encodedCredentials);
    const [email, password] = decodedString.split(':');
    
    return { email, password };
  } catch (error) {
    console.error('Error decoding DataForSEO credentials:', error);
    return { email: '', password: '' };
  }
};

/**
 * Check if a string appears to be in DataForSEO format (base64 encoded)
 * 
 * @param key - API key to check
 * @returns boolean - Whether the key appears to be in DataForSEO format
 */
export const isDataForSeoFormat = (key: string): boolean => {
  try {
    // Check if it's a valid base64 string
    const decodedString = atob(key);
    
    // Check if it contains a colon (email:password format)
    return decodedString.includes(':');
  } catch (error) {
    return false;
  }
};

/**
 * Attempt to detect the type of API key based on its format
 * 
 * @param key - API key to detect
 * @returns string | null - Detected API key type or null if unknown
 */
export const detectApiKeyType = (key: string): string | null => {
  if (!key) return null;
  
  // Check OpenAI format
  if (key.startsWith('sk-') && key.length > 20) {
    return 'openai';
  }
  
  // Check Anthropic format
  if (key.startsWith('sk-ant-') && key.length > 20) {
    return 'anthropic';
  }
  
  // Check Gemini format
  if (key.length > 30 && /^[A-Za-z0-9_-]{30,}$/.test(key)) {
    return 'gemini';
  }
  
  // Check DataForSEO format (base64 encoded email:password)
  if (isDataForSeoFormat(key)) {
    return 'dataforseo';
  }
  
  // Check SERP API format (typically a hash-like string)
  if (/^[a-zA-Z0-9]{20,40}$/.test(key)) {
    return 'serpapi';
  }
  
  // Unknown format
  return null;
};
