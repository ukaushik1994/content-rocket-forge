
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getApiKey } from "./apiKeys";

export type ApiProxyParams = {
  service: 'serp' | 'openai' | 'anthropic' | 'gemini';
  endpoint: string;
  params?: Record<string, any>;
};

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
    
    // Call the API proxy with the actual API key
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify({
        ...config,
        // Pass the actual API key, not just a flag
        apiKey: apiKey,
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
    
    // Return the data from the API proxy
    return data as T;
  } catch (error: any) {
    console.error(`Error calling ${config.service} API:`, error);
    
    // For all service errors, notify user
    toast.error(`API error: ${error.message || 'Unknown error'}`);
    return null;
  }
}
