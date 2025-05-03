
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ApiProxyParams = {
  service: 'serp' | 'openai';
  endpoint: string;
  params?: Record<string, any>;
};

export async function callApiProxy<T>(config: ApiProxyParams): Promise<T | null> {
  try {
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify(config),
    });
    
    if (error) {
      console.error(`Error calling ${config.service} API:`, error);
      // Only show toast for non-"API key not configured" errors
      if (!error.message.includes('API key not configured')) {
        toast.error(`API error: ${error.message || 'Unknown error'}`);
      } else {
        // For API key configuration errors, show a more helpful message
        console.warn(`${config.service.toUpperCase()} API key not configured. Using mock data instead.`);
        toast.warning(`${config.service.toUpperCase()} API key not configured. Using mock data instead. Configure your API keys in Settings.`);
      }
      return null;
    }
    
    return data as T;
  } catch (error: any) {
    console.error(`Error calling ${config.service} API:`, error);
    
    // For all service errors, notify user but allow the app to continue with mock data
    toast.error(`API error: ${error.message || 'Unknown error'}`);
    return null;
  }
}
