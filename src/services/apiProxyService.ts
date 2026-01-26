
import { supabase } from '@/integrations/supabase/client';
import { getApiKey } from './apiKeyService';
import { toast } from 'sonner';
import { 
  classifyApiError, 
  isProviderRateLimited, 
  recordRateLimitError,
  clearRateLimitState,
  getRateLimitCooldown,
  getAvailableSerpProvider,
  notifyApiError,
  type ApiProvider
} from './apiErrorResilience';

export type SerpProvider = 'serp' | 'serpstack';
export type AIProvider = 'openai' | 'anthropic' | 'gemini';
export type AllProviders = SerpProvider | AIProvider;

interface ApiProxyParams {
  service: string;
  endpoint: string;
  params?: any;
}

interface CallOptions {
  skipRateLimitCheck?: boolean;
  showErrorToast?: boolean;
  allowFallback?: boolean;
}

/**
 * Call the unified API proxy service with any provider
 * Now includes rate limit awareness and automatic fallback for SERP providers
 */
export async function callApiProxy(
  provider: AllProviders, 
  endpoint: string, 
  params?: any,
  options: CallOptions = {}
) {
  const { 
    skipRateLimitCheck = false, 
    showErrorToast = true,
    allowFallback = true 
  } = options;

  // Check if provider is rate limited (skip for test endpoint)
  if (!skipRateLimitCheck && endpoint !== 'test' && isProviderRateLimited(provider as ApiProvider)) {
    const cooldown = getRateLimitCooldown(provider as ApiProvider);
    console.warn(`⏰ ${provider} is rate limited for ${cooldown}s`);
    
    // Try fallback for SERP providers
    if (allowFallback && (provider === 'serp' || provider === 'serpstack')) {
      const fallbackProvider = getAvailableSerpProvider();
      if (fallbackProvider && fallbackProvider !== provider) {
        console.log(`🔄 Using fallback SERP provider: ${fallbackProvider}`);
        toast.info(`Switching to ${fallbackProvider.toUpperCase()}`, {
          description: `${provider.toUpperCase()} is rate limited. Using fallback provider.`
        });
        return callApiProxy(fallbackProvider as AllProviders, endpoint, params, {
          ...options,
          allowFallback: false // Prevent infinite fallback loop
        });
      }
    }
    
    // No fallback available
    const error = new Error(`${provider.toUpperCase()} is rate limited. Please wait ${cooldown} seconds.`);
    if (showErrorToast) {
      toast.warning('API Rate Limited', {
        description: `${provider.toUpperCase()} API is cooling down. Try again in ${cooldown}s.`
      });
    }
    throw error;
  }

  try {
    console.log(`🚀 Calling API Proxy: ${provider} - ${endpoint}`);
    
    const apiKey = await getApiKey(provider);
    
    if (!apiKey) {
      throw new Error(`No ${provider.toUpperCase()} API key found. Please configure it in Settings.`);
    }

    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: {
        service: provider,
        endpoint,
        apiKey,
        params
      }
    });
    
    if (error) {
      console.error(`❌ API Proxy error for ${provider}:`, error);
      throw new Error(`${provider.toUpperCase()} API error: ${error.message || JSON.stringify(error)}`);
    }
    
    if (!data) {
      console.warn(`⚠️ No data returned from ${provider}`);
      return null;
    }
    
    // Handle rate limit response from edge function
    if (data.isRateLimited) {
      console.warn(`⚠️ Rate limit detected for ${provider}`);
      recordRateLimitError(provider as ApiProvider, 60);
      
      // Try fallback for SERP providers
      if (allowFallback && (provider === 'serp' || provider === 'serpstack')) {
        const fallbackProvider = getAvailableSerpProvider();
        if (fallbackProvider && fallbackProvider !== provider) {
          console.log(`🔄 Rate limited - using fallback: ${fallbackProvider}`);
          toast.info(`Switching to ${fallbackProvider.toUpperCase()}`, {
            description: `${provider.toUpperCase()} hit rate limit. Using fallback.`
          });
          return callApiProxy(fallbackProvider as AllProviders, endpoint, params, {
            ...options,
            allowFallback: false
          });
        }
      }
      
      throw new Error(data.error || `${provider.toUpperCase()} rate limit exceeded`);
    }
    
    if (!data.success && data.error) {
      throw new Error(data.error);
    }
    
    // Clear any rate limit state on success
    clearRateLimitState(provider as ApiProvider);
    
    console.log(`✅ ${provider.toUpperCase()} API call successful`);
    
    // Log usage for analytics (async, don't block response)
    if (endpoint !== 'test') {
      import('./usageTrackingService').then(({ UsageTrackingService }) => {
        if (provider === 'serp' || provider === 'serpstack') {
          UsageTrackingService.logSerpUsage(provider, endpoint, true, params);
        }
      }).catch(console.error);
    }
    
    return data;
  } catch (error) {
    console.error(`💥 Error calling ${provider} API:`, error);
    
    // Classify and handle the error
    const apiError = classifyApiError(error, provider as ApiProvider);
    
    // Record rate limit errors
    if (apiError.type === 'RATE_LIMIT' || apiError.type === 'QUOTA_EXCEEDED') {
      recordRateLimitError(provider as ApiProvider, apiError.retryAfter || 60);
      
      // Try fallback for SERP providers
      if (allowFallback && apiError.canFallback && apiError.fallbackProvider) {
        const fallback = apiError.fallbackProvider;
        if (!isProviderRateLimited(fallback)) {
          console.log(`🔄 Error fallback to ${fallback}`);
          toast.info(`Switching to ${fallback.toUpperCase()}`, {
            description: `${provider.toUpperCase()} error. Using fallback provider.`
          });
          return callApiProxy(fallback as AllProviders, endpoint, params, {
            ...options,
            allowFallback: false
          });
        }
      }
    }
    
    // Show error toast if enabled
    if (showErrorToast) {
      notifyApiError(apiError);
    }
    
    throw error;
  }
}

/**
 * Test API connection for a specific provider
 */
export async function testApiConnection(provider: AllProviders) {
  try {
    // Skip rate limit check for test endpoint
    const result = await callApiProxy(provider, 'test', undefined, {
      skipRateLimitCheck: true,
      showErrorToast: false,
      allowFallback: false
    });
    
    if (result && result.success) {
      toast.success(`${result.provider || provider.toUpperCase()} connection successful!`);
      return true;
    } else {
      toast.error(`${provider.toUpperCase()} connection failed`);
      return false;
    }
  } catch (error: any) {
    console.error(`${provider.toUpperCase()} test failed:`, error);
    toast.error(`${provider.toUpperCase()} test failed: ${error.message}`);
    return false;
  }
}

/**
 * Analyze keyword with specific provider (with automatic fallback)
 */
export async function analyzeKeywordWithProvider(provider: SerpProvider, keyword: string) {
  try {
    console.log(`🎯 Analyzing keyword "${keyword}" with ${provider.toUpperCase()}`);
    
    // Use automatic fallback for SERP analysis
    const result = await callApiProxy(provider, 'analyze', { keyword }, {
      allowFallback: true,
      showErrorToast: true
    });
    
    if (result) {
      const actualProvider = result.provider || provider;
      toast.success(`${actualProvider.toUpperCase()} analysis completed for "${keyword}"`);
      return result;
    } else {
      throw new Error(`No data returned from ${provider.toUpperCase()}`);
    }
  } catch (error: any) {
    console.error(`${provider.toUpperCase()} analysis failed:`, error);
    // Error toast already shown by callApiProxy
    throw error;
  }
}

/**
 * Search with specific provider (with automatic fallback)
 */
export async function searchWithProvider(provider: SerpProvider, query: string, limit = 10) {
  try {
    console.log(`🔍 Searching "${query}" with ${provider.toUpperCase()}`);
    
    const result = await callApiProxy(provider, 'search', { 
      q: query, 
      keyword: query,
      limit 
    }, {
      allowFallback: true,
      showErrorToast: true
    });
    
    if (result) {
      return result;
    } else {
      throw new Error(`No search results from ${provider.toUpperCase()}`);
    }
  } catch (error: any) {
    console.error(`${provider.toUpperCase()} search failed:`, error);
    // Error toast already shown by callApiProxy
    throw error;
  }
}

/**
 * Get the current status of SERP providers
 */
export function getSerpProviderStatus() {
  return {
    serp: {
      isLimited: isProviderRateLimited('serp'),
      cooldown: getRateLimitCooldown('serp')
    },
    serpstack: {
      isLimited: isProviderRateLimited('serpstack'),
      cooldown: getRateLimitCooldown('serpstack')
    },
    availableProvider: getAvailableSerpProvider()
  };
}

/**
 * Smart SERP call - automatically uses best available provider
 */
export async function callSerpSmart(endpoint: string, params?: any) {
  const availableProvider = getAvailableSerpProvider();
  
  if (!availableProvider) {
    const serpCooldown = getRateLimitCooldown('serp');
    const serpstackCooldown = getRateLimitCooldown('serpstack');
    const minCooldown = Math.min(serpCooldown, serpstackCooldown);
    
    throw new Error(`All SERP providers are rate limited. Please wait ${minCooldown} seconds.`);
  }
  
  console.log(`🎯 Smart SERP call using: ${availableProvider}`);
  return callApiProxy(availableProvider as AllProviders, endpoint, params, {
    allowFallback: true
  });
}
