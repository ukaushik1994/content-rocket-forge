
import { toast } from "sonner";
import { getApiKey } from "../apiKeys/crud";
import { AiProvider } from "./types";
import { getFallbackConfig, notifyProviderFallback } from "./providerFallback";
import { sendChatRequest, generateCompletion } from "./aiService";

/**
 * Handle API errors with optional fallback
 * @param provider The provider that failed
 * @param error The error that occurred
 * @param params The original parameters
 * @param requestType The type of request (chat or completion)
 * @returns Result of the fallback callback or null
 */
export async function handleApiError<T>(
  provider: AiProvider,
  error: any,
  params: any,
  requestType: 'chat' | 'completion',
  fallbackDepth: number = 0
): Promise<T | null> {
  // Log the original error
  console.error(`Error with ${provider} API:`, error);
  
  // Prevent infinite fallback loops
  if (fallbackDepth >= 2) {
    console.error('Maximum fallback depth reached, stopping fallback attempts');
    toast.error(`All AI providers failed. Please check your API keys in Settings.`);
    return null;
  }
  
  // Get fallback configuration
  const { enabled, fallbackProviders } = getFallbackConfig();
  
  if (enabled && fallbackProviders.length > 0) {
    return await attemptProviderFallback(provider, error, params, requestType, fallbackDepth + 1);
  } else {
    // Show error message without fallback
    toast.error(`API error: ${error.message || 'Unknown error'}`);
    return null;
  }
}

/**
 * Attempt to use fallback providers when a provider fails
 * @param provider The provider that failed
 * @param error The error that occurred
 * @param params The original parameters
 * @param requestType The type of request (chat or completion)
 * @returns Result from fallback provider or null
 */
export async function attemptProviderFallback<T>(
  provider: AiProvider,
  error: any,
  params: any,
  requestType: 'chat' | 'completion',
  fallbackDepth: number = 0
): Promise<T | null> {
  // Get fallback configuration
  const { enabled, fallbackProviders } = getFallbackConfig();
  
  if (!enabled || fallbackProviders.length === 0) {
    toast.error(`${provider.toUpperCase()} API error: ${error.message || 'Unknown error'}`);
    return null;
  }
  
  // Check if the error is a quota/rate limit issue
  const isQuotaError = isQuotaLimitError(error);
  
  // Show appropriate message
  if (isQuotaError) {
    toast.error(
      `${provider.toUpperCase()} API quota exceeded. Trying alternative AI provider...`
    );
  } else {
    toast.error(
      `${provider.toUpperCase()} API error: ${error.message || 'Unknown error'}. Trying alternative AI provider...`
    );
  }
  
  // Try fallback providers
  for (const fallbackProvider of fallbackProviders) {
    console.log(`Attempting fallback to: ${fallbackProvider}`);
    const fallbackApiKey = await getApiKey(fallbackProvider);
    
    if (fallbackApiKey) {
      notifyProviderFallback(provider, fallbackProvider);
      
      // Call the appropriate function based on request type with skipFallback to prevent loops
      if (requestType === 'chat') {
        return sendChatRequest(fallbackProvider, params, true) as T;
      } else {
        return generateCompletion(fallbackProvider, params, true) as T;
      }
    }
  }
  
  toast.error('No AI provider is configured. Please add at least one API key in Settings.');
  return null;
}

/**
 * Check if an error is related to quota or rate limits
 */
export function isQuotaLimitError(error: any): boolean {
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
