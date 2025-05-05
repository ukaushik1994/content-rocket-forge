
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AiProvider } from "./types";

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
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify({
        service: provider,
        endpoint: 'test',
        apiKey: key
      }),
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

/**
 * Detect the type of AI API key based on its format
 * @param key The API key to detect
 * @returns A promise that resolves to the provider name or null
 */
export async function detectAiKeyType(key: string): Promise<AiProvider | null> {
  // Basic key pattern detection
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return null;
  }
  
  // OpenAI API keys start with "sk-" but not "sk-ant-"
  if (key.startsWith('sk-') && !key.startsWith('sk-ant-')) {
    return 'openai';
  } 
  
  // Anthropic API keys start with "sk-ant-"
  else if (key.startsWith('sk-ant-')) {
    return 'anthropic';
  } 
  
  // Gemini/Google API keys often start with "AIza"
  else if (key.startsWith('AIza')) {
    return 'gemini';
  }
  
  // Unknown format
  return null;
}

/**
 * Get a friendly name for an AI provider
 * @param provider The provider identifier
 * @returns The friendly name
 */
export function getProviderFriendlyName(provider: AiProvider): string {
  switch (provider) {
    case 'openai':
      return 'OpenAI';
    case 'anthropic':
      return 'Anthropic';
    case 'gemini':
      return 'Google Gemini';
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}
