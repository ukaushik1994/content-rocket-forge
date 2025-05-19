
/**
 * Helper functions to check if an API key matches expected patterns for various AI providers
 */

/**
 * Check if the provided key appears to be a valid OpenAI API key format
 */
export function isOpenAIKeyFormat(key: string): boolean {
  return /^sk-[a-zA-Z0-9]{32,}$/.test(key);
}

/**
 * Check if the provided key appears to be a valid Anthropic API key format
 */
export function isAnthropicKeyFormat(key: string): boolean {
  return /^sk-ant-[a-zA-Z0-9]{32,}$/.test(key);
}

/**
 * Check if the provided key appears to be a valid Gemini API key format
 */
export function isGeminiKeyFormat(key: string): boolean {
  return /^AIzaSy[a-zA-Z0-9-_]{32,}$/.test(key);
}

/**
 * Check if the provided key appears to be a valid Mistral API key format
 */
export function isMistralKeyFormat(key: string): boolean {
  return /^[a-zA-Z0-9]{32,}$/.test(key);
}

/**
 * Check if the provided key appears to be a valid DataForSEO credentials format
 * DataForSEO uses base64 encoded login:password format
 */
export function isDataForSeoFormat(key: string): boolean {
  try {
    // Try to decode the base64 string
    const decoded = atob(key);
    // Check if it has the login:password format
    return decoded.includes(':');
  } catch (error) {
    return false;
  }
}

/**
 * Encode DataForSEO email and password as base64 string in the format expected by the API
 */
export function encodeDataForSeoCredentials(email: string, password: string): string {
  return btoa(`${email}:${password}`);
}

/**
 * Decode DataForSEO credentials from base64 string
 */
export function decodeDataForSeoCredentials(encoded: string): { email: string; password: string } {
  try {
    const decoded = atob(encoded);
    const [email, password] = decoded.split(':');
    return { email: email || '', password: password || '' };
  } catch (error) {
    console.error('Error decoding DataForSEO credentials:', error);
    return { email: '', password: '' };
  }
}

/**
 * Attempts to detect what type of API key this is based on its format
 */
export function detectApiKeyType(key: string): string | null {
  if (isOpenAIKeyFormat(key)) return 'openai';
  if (isAnthropicKeyFormat(key)) return 'anthropic';
  if (isGeminiKeyFormat(key)) return 'gemini';
  if (isMistralKeyFormat(key)) return 'mistral';
  if (isDataForSeoFormat(key)) return 'dataforseo';
  return null;
}

/**
 * Validate that a key for a specific provider appears to be in the correct format
 */
export function validateProviderKeyFormat(provider: string, key: string): boolean {
  switch (provider) {
    case 'openai':
      return isOpenAIKeyFormat(key);
    case 'anthropic':
      return isAnthropicKeyFormat(key);
    case 'gemini':
      return isGeminiKeyFormat(key);
    case 'mistral':
      return isMistralKeyFormat(key);
    case 'dataforseo':
      return isDataForSeoFormat(key);
    default:
      return true; // For other providers we don't have format validation
  }
}
