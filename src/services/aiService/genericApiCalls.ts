
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getApiKey } from "../apiKeys/crud";
import { AiApiParams, AiProvider } from "./types";
import { getFallbackConfig, notifyProviderFallback } from "./providerFallback";

/**
 * Low-level function to make a custom AI API call with fallback support
 * @param config The API configuration
 * @returns A promise that resolves to the API response
 */
export async function callAiApi<T>(config: AiApiParams): Promise<T | null> {
  try {
    console.log(`Calling AI API with provider: ${config.provider}`);
    
    // Get the API key if not provided in the config
    const apiKey = config.apiKey || await getApiKey(config.provider);
    const hasApiKey = !!apiKey;
    
    if (!hasApiKey) {
      console.warn(`${config.provider.toUpperCase()} API key not configured. Please configure your API key in Settings.`);
      
      // Get fallback configuration and check if we should try fallback
      const { enabled, fallbackProviders } = getFallbackConfig();
      
      if (enabled && config.provider && fallbackProviders.length > 0) {
        // Try fallback providers
        return await handleGenericProviderError(
          config.provider as AiProvider, 
          new Error(`${config.provider} API key not configured`), 
          config
        );
      }
      
      toast.warning(`${config.provider.toUpperCase()} API key not configured. Configure your API keys in Settings.`);
      return null;
    }
    
    // Determine the appropriate proxy function
    let proxyFunction: string;
    let requestBody: any;
    
    if (['openai', 'anthropic', 'gemini', 'mistral'].includes(config.provider)) {
      proxyFunction = 'ai-proxy';
      requestBody = {
        service: config.provider,
        endpoint: config.endpoint,
        params: config.params,
        apiKey
      };
    } else if (config.provider === 'serp') {
      proxyFunction = 'serp-proxy';
      requestBody = {
        endpoint: config.endpoint,
        params: config.params,
        apiKey
      };
    } else {
      // Fallback to legacy api-proxy
      proxyFunction = 'api-proxy';
      requestBody = {
        ...config,
        apiKey,
        hasApiKey
      };
    }
    
    // Call the appropriate API proxy function
    const { data, error } = await supabase.functions.invoke(proxyFunction, {
      body: JSON.stringify(requestBody),
    });
    
    if (error) {
      // Handle error with fallback
      const { enabled, fallbackProviders } = getFallbackConfig();
      
      if (enabled && config.provider && fallbackProviders.length > 0) {
        return await handleGenericProviderError(config.provider as AiProvider, error, config);
      } else {
        console.error(`Error calling ${config.provider} API:`, error);
        toast.error(`API error: ${error.message || 'Unknown error'}`);
        return null;
      }
    }
    
    return data as T;
  } catch (error: any) {
    if (config.provider) {
      return await handleGenericProviderError(config.provider as AiProvider, error, config);
    } else {
      console.error(`Error calling AI API:`, error);
      toast.error(`API error: ${error.message || 'Unknown error'}`);
      return null;
    }
  }
}

/**
 * Handle provider errors for generic API calls
 */
async function handleGenericProviderError<T>(
  provider: AiProvider, 
  error: any, 
  config: AiApiParams
): Promise<T | null> {
  console.error(`Error with ${provider} API:`, error);
  
  // Get fallback configuration
  const { enabled, fallbackProviders } = getFallbackConfig();
  
  if (!enabled || fallbackProviders.length === 0) {
    toast.error(`${provider.toUpperCase()} API error: ${error.message || 'Unknown error'}`);
    return null;
  }
  
  // Try fallback providers
  for (const fallbackProvider of fallbackProviders) {
    console.log(`Attempting fallback to: ${fallbackProvider}`);
    const fallbackApiKey = await getApiKey(fallbackProvider);
    
    if (fallbackApiKey) {
      notifyProviderFallback(provider, fallbackProvider);
      return callAiApi<T>({
        ...config,
        provider: fallbackProvider
      });
    }
  }
  
  toast.error('No AI provider is configured. Please add at least one API key in Settings.');
  return null;
}
