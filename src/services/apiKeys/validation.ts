
/**
 * API key validation utilities
 */

/**
 * Detect what type of API key this might be based on its format
 * @param key - The API key to analyze
 * @returns A string representing the likely service, or null if unknown
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
  
  // Check if it might be a base64 encoded string (DataForSEO)
  try {
    const decoded = atob(key);
    if (decoded.includes('"login"') && decoded.includes('"password"')) {
      return 'dataforseo';
    }
  } catch (e) {
    // Not base64 encoded, continue checking other formats
  }
  
  // Unknown format
  return null;
};

/**
 * Validate an API key format (simple validation, not checking if it works)
 * @param service - The service to validate the key for
 * @param key - The API key to validate
 * @returns Boolean indicating if the key format appears valid
 */
export const validateApiKeyFormat = (service: string, key: string): boolean => {
  if (!key || !service) return false;
  
  switch (service) {
    case 'openai':
      return key.startsWith('sk-') && key.length > 20;
    case 'anthropic':
      return key.startsWith('sk-ant-') && key.length > 20;
    case 'dataforseo':
      return isDataForSeoFormat(key);
    case 'serp':
      return key.length > 10;
    case 'gemini':
      return key.length > 10;
    default:
      return key.length > 8;
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
