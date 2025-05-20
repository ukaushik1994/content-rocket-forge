
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { toast } from 'sonner';

// Local storage keys
const ACTIVE_PROVIDER_KEY = 'active_serp_provider';

/**
 * Activate a SERP provider, deactivate all others
 */
export const activateProvider = (provider: SerpProvider): boolean => {
  try {
    // Check if the provider has an API key
    const apiKey = getProviderApiKey(provider);
    
    if (!apiKey) {
      toast.error(`No API key found for ${provider}. Please add an API key first.`);
      return false;
    }
    
    // Set this provider as active
    localStorage.setItem(ACTIVE_PROVIDER_KEY, provider);
    return true;
  } catch (error) {
    console.error(`Error activating ${provider}:`, error);
    toast.error(`Failed to activate ${provider}`);
    return false;
  }
};

/**
 * Deactivate a SERP provider
 */
export const deactivateProvider = (provider: SerpProvider): boolean => {
  try {
    // If this is the active provider, remove it
    const activeProvider = localStorage.getItem(ACTIVE_PROVIDER_KEY);
    
    if (activeProvider === provider) {
      localStorage.removeItem(ACTIVE_PROVIDER_KEY);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deactivating ${provider}:`, error);
    toast.error(`Failed to deactivate ${provider}`);
    return false;
  }
};

/**
 * Check if a provider is active
 */
export const isProviderActive = (provider: SerpProvider): boolean => {
  const activeProvider = localStorage.getItem(ACTIVE_PROVIDER_KEY);
  return activeProvider === provider;
};

/**
 * Get the API key for a specific provider
 */
export const getProviderApiKey = (provider: SerpProvider): string | null => {
  switch (provider) {
    case 'serpapi':
      return localStorage.getItem('serp_api_key');
    case 'dataforseo':
      return localStorage.getItem('dataforseo_api_key');
    case 'mock':
      return 'mock-key'; // Mock always has a key
    default:
      return null;
  }
};

/**
 * Get the status of a SERP provider
 * Returns 'active' if provider is active and has an API key
 * Returns 'configured' if provider has an API key but isn't active
 * Returns 'not-configured' if provider doesn't have an API key
 */
export const getSerpProviderStatus = (provider: SerpProvider): 'active' | 'configured' | 'not-configured' => {
  const apiKey = getProviderApiKey(provider);
  const active = isProviderActive(provider);
  
  if (!apiKey) {
    return 'not-configured';
  }
  
  return active ? 'active' : 'configured';
};

