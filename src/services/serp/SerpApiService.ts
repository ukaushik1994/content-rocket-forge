
/**
 * Unified SERP API Service
 * Central service for interacting with different SERP providers
 */

import { SerpApiOptions } from "./adapters/types";
import { SerpAnalysisResult } from "@/types/serp";
import { SerpProvider } from "@/contexts/content-builder/types/serp-types";
import { AdapterFactory } from "./adapters/AdapterFactory";
import { ErrorHandler } from "./error-handling/ErrorHandler";
import { UsageTracker } from "./usage-tracking/UsageTracker";
import { getApiKey, saveApiKey, deleteApiKey, hasApiKey } from "@/services/apiKeys/storage";

// Cache settings
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_PREFIX = 'serp_cache_';

/**
 * Get the preferred SERP provider from local storage or return the default
 */
export const getPreferredSerpProvider = (): SerpProvider => {
  const savedProvider = localStorage.getItem('preferred_serp_provider');
  return (savedProvider as SerpProvider) || 'serpapi';
};

/**
 * Save the preferred SERP provider to local storage
 */
export const setPreferredSerpProvider = (provider: SerpProvider): void => {
  localStorage.setItem('preferred_serp_provider', provider);
};

/**
 * Analyze a keyword with the specified provider
 */
export const analyzeKeyword = async (
  keyword: string, 
  refresh?: boolean, 
  provider: SerpProvider = getPreferredSerpProvider()
): Promise<SerpAnalysisResult> => {
  try {
    // Check cache first if not refreshing
    if (!refresh) {
      const cachedData = getCachedResult(`analyze_${keyword}`, provider);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Track usage
    UsageTracker.getInstance().trackUsage(provider, 'analyzeKeyword');
    
    // Get the adapter for the provider
    const adapter = AdapterFactory.getAdapter(provider);
    
    // Call the adapter
    const result = await adapter.analyzeKeyword({ keyword, refresh });
    
    // Cache the result
    cacheResult(`analyze_${keyword}`, provider, result);
    
    return result;
  } catch (error) {
    // Handle errors
    ErrorHandler.handleError(error, provider);
    
    // Return mock data as fallback
    return AdapterFactory.getAdapter('mock').analyzeKeyword({ keyword, refresh });
  }
};

/**
 * Search for keywords with the specified provider
 */
export const searchKeywords = async (params: SerpApiOptions) => {
  try {
    const { 
      keyword, 
      limit = 10, 
      refresh = false, 
      provider = getPreferredSerpProvider() 
    } = params;
    
    // Check cache first if not refreshing
    if (!refresh) {
      const cachedData = getCachedResult(`search_${keyword}`, provider);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Track usage
    UsageTracker.getInstance().trackUsage(provider, 'searchKeywords');
    
    // Get the adapter for the provider
    const adapter = AdapterFactory.getAdapter(provider);
    
    // Call the adapter
    const result = await adapter.searchKeywords(params);
    
    // Cache the result
    cacheResult(`search_${keyword}`, provider, result);
    
    return result;
  } catch (error) {
    // Handle errors
    ErrorHandler.handleError(error, params.provider || getPreferredSerpProvider());
    
    // Return mock data as fallback
    return AdapterFactory.getAdapter('mock').searchKeywords(params);
  }
};

/**
 * Search for related keywords with the specified provider
 */
export const searchRelatedKeywords = async (
  keyword: string, 
  provider: SerpProvider = getPreferredSerpProvider()
) => {
  try {
    // Check cache first
    const cachedData = getCachedResult(`related_${keyword}`, provider);
    if (cachedData) {
      return cachedData;
    }
    
    // Track usage
    UsageTracker.getInstance().trackUsage(provider, 'searchRelatedKeywords');
    
    // Get the adapter for the provider
    const adapter = AdapterFactory.getAdapter(provider);
    
    // Call the adapter
    const result = await adapter.searchRelatedKeywords({ keyword });
    
    // Cache the result
    cacheResult(`related_${keyword}`, provider, result);
    
    return result;
  } catch (error) {
    // Handle errors
    ErrorHandler.handleError(error, provider);
    
    // Return mock data as fallback
    return AdapterFactory.getAdapter('mock').searchRelatedKeywords({ keyword });
  }
};

/**
 * Test if an API key is valid
 */
export const testApiKey = async (
  provider: SerpProvider,
  apiKey: string
): Promise<boolean> => {
  try {
    // Get the adapter for the provider
    const adapter = AdapterFactory.getAdapter(provider);
    
    // Call the adapter
    return await adapter.testApiKey(apiKey);
  } catch (error) {
    // Handle errors
    ErrorHandler.handleError(error, provider);
    return false;
  }
};

/**
 * Save an API key for a provider
 */
export const saveSerpApiKey = async (
  provider: SerpProvider,
  apiKey: string
): Promise<boolean> => {
  try {
    return await saveApiKey(provider, apiKey);
  } catch (error) {
    console.error(`Error saving ${provider} API key:`, error);
    return false;
  }
};

/**
 * Check if a provider has an API key
 */
export const hasSerpApiKey = async (provider: SerpProvider): Promise<boolean> => {
  return await hasApiKey(provider);
};

/**
 * Cache a result
 */
function cacheResult(key: string, provider: SerpProvider, data: any): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${provider}_${key}`;
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching SERP result:', error);
  }
}

/**
 * Get a cached result if it exists and is not expired
 */
function getCachedResult<T>(key: string, provider: SerpProvider): T | null {
  try {
    const cacheKey = `${CACHE_PREFIX}${provider}_${key}`;
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (!cachedItem) {
      return null;
    }
    
    const { data, timestamp } = JSON.parse(cachedItem);
    
    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return data as T;
  } catch (error) {
    console.error('Error retrieving cached SERP result:', error);
    return null;
  }
}

/**
 * Clear all cached results
 */
export function clearSerpCache(): void {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Filter to just cache keys
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    // Remove all cache items
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing SERP cache:', error);
  }
}

/**
 * Get usage statistics for a provider
 */
export function getProviderUsageStats(provider: SerpProvider): any {
  return UsageTracker.getInstance().getProviderUsage(provider);
}

/**
 * Get total usage across all providers
 */
export function getTotalUsageStats(): number {
  return UsageTracker.getInstance().getTotalUsage();
}

// Export types from SerpAnalysisResult to avoid user having to import from multiple places
export type { SerpAnalysisResult };
