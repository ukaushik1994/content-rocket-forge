
// Testing API keys

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Test an API key for a particular service
 * @param service The service to test the API key for
 * @param key The API key to test
 * @returns A promise that resolves to a boolean indicating success
 */
export async function testApiKey(service: string, key: string): Promise<boolean> {
  try {
    if (!key.trim()) {
      toast.error('API key cannot be empty');
      return false;
    }

    // Use the Edge Function to test the API key
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify({
        service,
        endpoint: 'test',
        apiKey: key
      }),
    });

    if (error) {
      console.error(`Error testing ${service} API key:`, error);
      toast.error(`Failed to test ${service} API key: ${error.message}`);
      return false;
    }

    if (data?.success) {
      console.log(`${service} API test successful:`, data);
      toast.success(data.message || `${service} API connection successful`);
      return true;
    } else {
      console.error(`${service} API test failed:`, data);
      toast.error(data?.error || `${service} API connection failed`);
      return false;
    }
  } catch (error: any) {
    console.error(`Error testing ${service} API key:`, error);
    toast.error(error.message || `${service} API connection failed`);
    return false;
  }
}

/**
 * Detect the type of API key based on its format
 * @param key The API key to detect
 * @returns A promise that resolves to the service name or null
 */
export async function detectApiKeyType(key: string): Promise<string | null> {
  // Detect API key type based on common formats
  if (key.startsWith('sk-') && !key.startsWith('sk-ant-')) {
    return 'openai';
  } else if (key.startsWith('sk-ant-')) {
    return 'anthropic';
  } else if (key.startsWith('AIza')) {
    return 'gemini';
  } else if (key.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(key)) {
    // Generic format check for SERP API keys
    return 'serp';
  }
  
  return null;
}
