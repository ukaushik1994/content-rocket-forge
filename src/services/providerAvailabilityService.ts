import { getApiKey } from '@/services/apiKeyService';
import { testApiKey } from '@/services/apiKeys/testing';
import { hasApiKey } from '@/services/apiKeys/crud';
import { AiProvider } from '@/services/aiService/types';
import { ApiProvider } from '@/services/apiKeyService';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';

/**
 * Provider priority order - OpenRouter first as primary, then fallbacks
 */
const PROVIDER_PRIORITY: AiProvider[] = [
  'openrouter',  // Primary provider - prioritized for all operations
  'anthropic', 
  'gemini',
  'mistral',
  'openai',
  'lmstudio'
];

/**
 * Check which AI providers are available and working
 * @returns Promise<AiProvider[]> - Array of available providers in priority order
 */
export async function getAvailableProviders(): Promise<AiProvider[]> {
  const availableProviders: AiProvider[] = [];
  
  for (const provider of PROVIDER_PRIORITY) {
    try {
      const keyExists = await hasApiKey(provider as ApiProvider);
      if (keyExists) {
        // Just check if key exists - testing can be optional for performance
        availableProviders.push(provider);
      }
    } catch (error) {
      console.warn(`Error checking ${provider} availability:`, error);
    }
  }
  
  return availableProviders;
}

/**
 * Get the best available provider for the user
 * Prioritizes OpenRouter, falls back to others
 * @returns Promise<AiProvider | null> - The best available provider or null if none
 */
export async function getBestAvailableProvider(): Promise<AiProvider | null> {
  const available = await getAvailableProviders();
  return available.length > 0 ? available[0] : null;
}

/**
 * Check if a specific provider is available
 * @param provider - The provider to check
 * @returns Promise<boolean> - Whether the provider is available
 */
export async function isProviderAvailable(provider: AiProvider): Promise<boolean> {
  try {
    return await hasApiKey(provider as ApiProvider);
  } catch (error) {
    console.warn(`Error checking ${provider} availability:`, error);
    return false;
  }
}

/**
 * Get provider status with testing
 * @returns Promise<Record<AiProvider, boolean>> - Status of each provider
 */
export async function getProviderStatus(): Promise<Record<AiProvider, boolean>> {
  const status: Record<AiProvider, boolean> = {
    openrouter: false,
    anthropic: false,
    openai: false,
    gemini: false,
    mistral: false,
    lmstudio: false
  };
  
  for (const provider of PROVIDER_PRIORITY) {
    try {
      const keyExists = await hasApiKey(provider as ApiProvider);
      if (keyExists) {
        try {
          // For OpenRouter, we need to get the key differently
          if (provider === 'openrouter') {
            // Just mark as available since key exists and is checked above
            status[provider] = true;
          } else {
            const apiKey = await getApiKey(provider as ApiProvider);
            const testResult = await testApiKey(provider as ApiProvider, apiKey!);
            status[provider] = testResult;
          }
        } catch (error) {
          console.warn(`Error testing ${provider}:`, error);
          status[provider] = false;
        }
      }
    } catch (error) {
      console.warn(`Error checking ${provider}:`, error);
      status[provider] = false;
    }
  }
  
  return status;
}

/**
 * Get fallback providers for a given primary provider
 * @param primaryProvider - The primary provider that failed
 * @returns AiProvider[] - Array of fallback providers in priority order
 */
export function getFallbackProviders(primaryProvider: AiProvider): AiProvider[] {
  return PROVIDER_PRIORITY.filter(provider => provider !== primaryProvider);
}

/**
 * Initialize provider preferences with smart defaults (no OpenAI dependency)
 * Automatically selects the best available provider without requiring OpenAI
 */
export async function initializeProviderPreferences(): Promise<void> {
  const currentProvider = getUserPreference('defaultAiProvider');
  const availableProviders = await getAvailableProviders();
  
  console.log(`📊 Available providers: ${availableProviders.join(', ')}`);
  
  if (availableProviders.length > 0) {
    // If no provider is set or current provider is not available, set best available
    if (!currentProvider || !availableProviders.includes(currentProvider)) {
      const bestProvider = availableProviders[0]; // First in priority order
      await saveUserPreference('defaultAiProvider', bestProvider);
      console.log(`🎯 Set ${bestProvider} as default AI provider`);
    }
    
    // Enable fallback by default if multiple providers available
    const fallbackEnabled = getUserPreference('enableAiFallback');
    if (fallbackEnabled === undefined && availableProviders.length > 1) {
      await saveUserPreference('enableAiFallback', true);
      console.log('🔄 Enabled AI provider fallback by default');
    }
  } else {
    console.log('⚠️ No AI providers configured - user will need to set up at least one');
  }
}