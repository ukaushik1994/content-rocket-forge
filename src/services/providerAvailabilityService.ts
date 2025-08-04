import { getApiKey } from '@/services/apiKeyService';
import { testApiKey } from '@/services/apiKeys/testing';
import { AiProvider } from '@/services/aiService/types';
import { ApiProvider } from '@/services/apiKeyService';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';

/**
 * Provider priority order - OpenRouter first, then other providers
 */
const PROVIDER_PRIORITY: AiProvider[] = [
  'openrouter',
  'anthropic', 
  'openai',
  'gemini',
  'mistral',
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
      const apiKey = await getApiKey(provider as ApiProvider);
      if (apiKey) {
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
    const apiKey = await getApiKey(provider as ApiProvider);
    return !!apiKey;
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
      const apiKey = await getApiKey(provider as ApiProvider);
      if (apiKey) {
        try {
          const testResult = await testApiKey(provider as ApiProvider, apiKey);
          status[provider] = testResult;
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
 * Initialize and upgrade user preferences to prioritize OpenRouter
 * This helps migrate users from OpenAI to OpenRouter when possible
 */
export async function initializeProviderPreferences(): Promise<void> {
  const currentProvider = getUserPreference('defaultAiProvider');
  const availableProviders = await getAvailableProviders();
  
  // If no provider is set, or if OpenAI is default but OpenRouter is available, upgrade
  if (!currentProvider || (currentProvider === 'openai' && availableProviders.includes('openrouter'))) {
    const bestProvider = await getBestAvailableProvider();
    if (bestProvider) {
      await saveUserPreference('defaultAiProvider', bestProvider);
      console.log(`🔄 Upgraded default AI provider to ${bestProvider}`);
    }
  }
  
  // Enable fallback by default if not set and multiple providers available
  const fallbackEnabled = getUserPreference('enableAiFallback');
  if (fallbackEnabled === undefined && availableProviders.length > 1) {
    await saveUserPreference('enableAiFallback', true);
    console.log('🔄 Enabled AI provider fallback by default');
  }
}