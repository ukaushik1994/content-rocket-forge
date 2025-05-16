
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
 * Check if the provided key appears to be a valid Gemini API key format
 */
export function isGeminiKeyFormat(key: string): boolean {
  return /^AIzaSy[a-zA-Z0-9-_]{32,}$/.test(key);
}

/**
 * Attempts to detect what type of API key this is based on its format
 */
export function detectApiKeyType(key: string): string | null {
  if (isOpenAIKeyFormat(key)) return 'openai';
  if (isGeminiKeyFormat(key)) return 'gemini';
  return null;
}

/**
 * Validate that a key for a specific provider appears to be in the correct format
 */
export function validateProviderKeyFormat(provider: string, key: string): boolean {
  switch (provider) {
    case 'openai':
      return isOpenAIKeyFormat(key);
    case 'gemini':
      return isGeminiKeyFormat(key);
    default:
      return true; // For other providers we don't have format validation
  }
}
