import { validateApiKeyFormat } from "@/services/apiKeys/validation";

/**
 * Detect if a key matches a specific provider's format
 * @param provider The provider to check against
 * @param key The API key to validate
 * @returns Boolean indicating if the key matches the provider's format
 */
export function isValidProviderKeyFormat(provider: string, key: string): boolean {
  return validateApiKeyFormat(provider, key);
}

/**
 * Get a user-friendly error message for invalid key formats
 * @param provider The provider name
 * @returns A descriptive error message
 */
export function getProviderKeyFormatError(provider: string): string {
  switch (provider) {
    case 'openai':
      return 'OpenAI API keys must start with "sk-" followed by alphanumeric characters';
    case 'anthropic':
      return 'Anthropic API keys must start with "sk-ant-" followed by alphanumeric characters';
    case 'gemini':
      return 'Gemini API keys must start with "AIzaSy" followed by alphanumeric characters';
    case 'google-analytics':
      return 'Google Analytics credentials should be a Service Account JSON file. Simple API keys are rarely used for GA.';
    case 'google-search-console':
      return 'Google Search Console credentials should be a Service Account JSON file. Simple API keys are rarely used for GSC.';
    case 'mistral':
      return 'Mistral API keys must be at least 32 alphanumeric characters';
    case 'serp':
      return 'SERP API keys must be at least 16 alphanumeric characters with optional dashes and underscores';
    case 'serpstack':
      return 'Serpstack API keys must be 32-character alphanumeric strings';
    default:
      return `Invalid ${provider} API key format`;
  }
}
