
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
    
    if (error) throw new Error(error.message);
    return data as T;
  } catch (error: any) {
    console.error(`Error calling ${config.service} API:`, error);
    toast.error(`API error: ${error.message || 'Unknown error'}`);
    return null;
  }
}
