
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AiProvider } from "../types";

/**
 * Test an AI provider API key
 * @param provider The AI provider to test
 * @param key The API key to test
 * @returns A promise that resolves to a boolean indicating success
 */
export async function testAiApiKey(provider: AiProvider, key: string): Promise<boolean> {
  try {
    if (!key.trim()) {
      toast.error('API key cannot be empty');
      return false;
    }

    // Use the Edge Function to test the API key
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: {
        service: provider,
        endpoint: 'test',
        apiKey: key
      },
    });

    if (error) {
      console.error(`Error testing ${provider} API key:`, error);
      toast.error(`Failed to test ${provider} API key: ${error.message}`);
      return false;
    }

    if (data?.success) {
      console.log(`${provider} API test successful:`, data);
      toast.success(data.message || `${provider} API connection successful`);
      return true;
    } else {
      console.error(`${provider} API test failed:`, data);
      toast.error(data?.error || `${provider} API connection failed`);
      return false;
    }
  } catch (error: any) {
    console.error(`Error testing ${provider} API key:`, error);
    toast.error(error.message || `${provider} API connection failed`);
    return false;
  }
}
