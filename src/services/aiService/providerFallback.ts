import { toast } from "sonner";
import { getUserPreference } from "@/services/userPreferencesService";
import { AiProvider } from "./types";

/**
 * Check if fallback is enabled and determine the fallback provider
 * @returns Object containing fallback configuration
 */
export function getFallbackConfig() {
  const fallbackEnabled = getUserPreference('enableAiFallback') === true;
  const defaultProvider = getUserPreference('defaultAiProvider') as AiProvider || 'openai';
  
  // Define fallback order depending on the primary provider
  const fallbackProviders: Record<AiProvider, AiProvider[]> = {
    'openai': ['anthropic', 'gemini', 'mistral', 'lmstudio'],
    'anthropic': ['openai', 'gemini', 'mistral', 'lmstudio'],
    'gemini': ['openai', 'anthropic', 'mistral', 'lmstudio'],
    'mistral': ['openai', 'anthropic', 'gemini', 'lmstudio'],
    'lmstudio': ['openai', 'anthropic', 'gemini', 'mistral'],
    'other': ['openai', 'anthropic', 'gemini', 'mistral', 'lmstudio'],
    // Add the new providers with proper fallback preferences
    'gpt-4o': ['openai', 'gpt-4', 'anthropic', 'gemini', 'mistral'],
    'gpt-4': ['gpt-4o', 'openai', 'anthropic', 'gemini', 'mistral'],
    'gpt-3.5-turbo': ['openai', 'gpt-4o', 'anthropic', 'gemini', 'mistral'],
    'claude-3': ['anthropic', 'gpt-4o', 'openai', 'gemini', 'mistral']
  };
  
  return {
    enabled: fallbackEnabled,
    defaultProvider,
    fallbackProviders: fallbackProviders[defaultProvider] || []
  };
}

/**
 * Handle API errors with optional fallback
 * @param provider The provider that failed
 * @param error The error that occurred
 * @param fallbackCallback Function to call when fallback is enabled
 * @returns Result of the fallback callback or null
 */
export async function handleProviderError<T>(
  provider: AiProvider,
  error: any,
  fallbackCallback?: () => Promise<T | null>
): Promise<T | null> {
  // Log the original error
  console.error(`Error with ${provider} API:`, error);
  
  // Check if the error is a quota/rate limit issue
  const isQuotaError = isQuotaLimitError(error);
  
  // Get fallback configuration
  const { enabled, fallbackProviders } = getFallbackConfig();
  
  // If it's a quota error, show a specific message
  if (isQuotaError) {
    toast.error(
      `${provider.toUpperCase()} API quota exceeded. ${enabled ? 'Trying alternative AI provider...' : 'Please try again later or configure API fallback in settings.'}`
    );
  } else {
    // For other types of errors
    toast.error(
      `${provider.toUpperCase()} API error: ${error.message || 'Unknown error'}. ${enabled ? 'Trying alternative AI provider...' : ''}`
    );
  }
  
  // If fallback is enabled and a callback is provided, try the fallback
  if (enabled && fallbackCallback) {
    console.log(`Attempting fallback from ${provider} to alternative provider`);
    try {
      return await fallbackCallback();
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      toast.error('All AI providers failed. Please check your API keys in Settings.');
      return null;
    }
  }
  
  return null;
}

/**
 * Check if an error is related to quota or rate limits
 */
function isQuotaLimitError(error: any): boolean {
  const errorMessage = error.message || '';
  const quotaKeywords = [
    'quota',
    'rate limit',
    'exceeded',
    'too many requests',
    '429',
    'limit reached',
    'out of capacity'
  ];
  
  return quotaKeywords.some(keyword => 
    errorMessage.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Show a notification about AI provider fallback
 */
export function notifyProviderFallback(originalProvider: AiProvider, newProvider: AiProvider) {
  toast.info(
    `Using ${newProvider.toUpperCase()} as a fallback because ${originalProvider.toUpperCase()} was unavailable.`,
    { duration: 4000 }
  );
}
