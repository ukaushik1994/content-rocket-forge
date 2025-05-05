import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getApiKey } from "./apiKeyService";

export type ApiProxyParams = {
  service: 'serp' | 'openai';
  endpoint: string;
  params?: Record<string, any>;
};

export async function callApiProxy<T>(config: ApiProxyParams): Promise<T | null> {
  try {
    // Check if the user has configured an API key for this service
    const apiKey = await getApiKey(config.service);
    const hasApiKey = !!apiKey;
    
    // If no API key is configured, log a helpful message
    if (!hasApiKey) {
      console.warn(`${config.service.toUpperCase()} API key not configured. Please configure your API key in Settings.`);
      
      // Only show toast for non-initial API calls (to avoid spamming the user)
      if (config.service === 'serp' && config.endpoint === 'search') {
        toast.warning(`${config.service.toUpperCase()} API key not configured. Configure your API keys in Settings.`);
      }
    }
    
    // Call the API proxy
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify({
        ...config,
        // Pass a flag to indicate whether the user has configured an API key
        hasApiKey
      }),
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
    
    // If the data contains mock data and no API key is configured, return the mock data
    // Otherwise, we'll handle this in the calling service
    return data as T;
  } catch (error: any) {
    console.error(`Error calling ${config.service} API:`, error);
    
    // For all service errors, notify user but allow the app to continue with mock data
    toast.error(`API error: ${error.message || 'Unknown error'}`);
    return null;
  }
}
