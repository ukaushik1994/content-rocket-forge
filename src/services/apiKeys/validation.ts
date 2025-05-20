
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
 * Check if the provided key appears to be a valid SERP API key format
 * Most SERP API providers use simple alphanumeric strings
 */
export function isSerpApiKeyFormat(key: string): boolean {
  // Most SERP API keys are alphanumeric and at least 16 characters
  // This is a general format check - adjust based on the specific provider
  return /^[a-zA-Z0-9_-]{16,}$/.test(key);
}

/**
 * Attempts to detect what type of API key this is based on its format
 */
export function detectApiKeyType(key: string): string | null {
  if (isOpenAIKeyFormat(key)) return 'openai';
  if (isAnthropicKeyFormat(key)) return 'anthropic';
  if (isGeminiKeyFormat(key)) return 'gemini';
  if (isMistralKeyFormat(key)) return 'mistral';
  if (isSerpApiKeyFormat(key)) return 'serp';
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
    case 'serp':
      return isSerpApiKeyFormat(key);
    default:
      return true; // For other providers we don't have format validation
  }
}
