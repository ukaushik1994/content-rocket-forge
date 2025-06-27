
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getApiKey } from "./apiKeys";

export type ApiProxyParams = {
  service: 'serp' | 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'google-analytics' | 'google-search-console';
  endpoint: string;
  params?: Record<string, any>;
};

/**
 * Get the appropriate proxy function name for a service
 */
function getProxyFunction(service: string): string {
  if (['openai', 'anthropic', 'gemini', 'mistral'].includes(service)) {
    return 'ai-proxy';
  } else if (service === 'serp') {
    return 'serp-proxy';
  } else if (['google-analytics', 'google-search-console'].includes(service)) {
    return 'google-proxy';
  } else {
    // Fallback to legacy api-proxy for unknown services
    return 'api-proxy';
  }
}

/**
 * Prepare request body for the specific proxy function
 */
function prepareRequestBody(config: ApiProxyParams, apiKey: string | null): any {
  const proxyFunction = getProxyFunction(config.service);
  
  if (proxyFunction === 'ai-proxy') {
    return {
      service: config.service,
      endpoint: config.endpoint,
      params: config.params,
      apiKey
    };
  } else if (proxyFunction === 'serp-proxy') {
    return {
      endpoint: config.endpoint,
      params: config.params,
      apiKey
    };
  } else if (proxyFunction === 'google-proxy') {
    return {
      service: config.service,
      endpoint: config.endpoint,
      apiKey
    };
  } else {
    // Legacy format for api-proxy
    return {
      ...config,
      apiKey,
      hasApiKey: !!apiKey
    };
  }
}

export async function callApiProxy<T>(config: ApiProxyParams): Promise<T | null> {
  try {
    // Get the actual API key for this service
    const apiKey = await getApiKey(config.service);
    const hasApiKey = !!apiKey;
    
    // If no API key is configured, log a helpful message
    if (!hasApiKey) {
      console.warn(`${config.service.toUpperCase()} API key not configured. Please configure your API key in Settings.`);
      
      // Only show toast for non-initial API calls (to avoid spamming the user)
      if (config.service === 'serp' && config.endpoint === 'search') {
        toast.warning(`${config.service.toUpperCase()} API key not configured. Configure your API keys in Settings.`);
      }
      return null;
    }
    
    // Determine which proxy function to use
    const proxyFunction = getProxyFunction(config.service);
    const requestBody = prepareRequestBody(config, apiKey);
    
    console.log(`Calling ${proxyFunction} for ${config.service} - ${config.endpoint}`);
    
    // Call the appropriate API proxy function
    const { data, error } = await supabase.functions.invoke(proxyFunction, {
      body: JSON.stringify(requestBody),
    });
    
    if (error) {
      console.error(`Error calling ${config.service} API:`, error);
      
      // Only show toast for non-"API key not configured" errors
      if (!error.message.includes('API key not configured')) {
        toast.error(`API error: ${error.message || 'Unknown error'}`);
      } else {
        // For API key configuration errors, show a more helpful message
        console.warn(`${config.service.toUpperCase()} API key not configured. Configure your API keys in Settings.`);
        toast.warning(`${config.service.toUpperCase()} API key not configured. Configure your API keys in Settings.`);
      }
      return null;
    }
    
    // Return the data from the API proxy
    return data as T;
  } catch (error: any) {
    console.error(`Error calling ${config.service} API:`, error);
    
    // For all service errors, notify user
    toast.error(`API error: ${error.message || 'Unknown error'}`);
    return null;
  }
}
