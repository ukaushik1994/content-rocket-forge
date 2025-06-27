
import { ApiProvider } from '../apiKeyService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Test an API key by making a simple validation request
 * @param provider The API provider to test
 * @param apiKey The API key to test
 * @returns Promise<boolean> indicating if the key works
 */
export async function testApiKey(provider: ApiProvider, apiKey: string): Promise<boolean> {
  try {
    console.log(`🧪 Testing ${provider} API key`);
    
    // For now, we'll do basic format validation since we don't have the api-proxy function
    // This can be enhanced later with actual API calls
    switch (provider) {
      case 'openai':
        return apiKey.startsWith('sk-') && apiKey.length > 20;
      
      case 'anthropic':
        return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
      
      case 'gemini':
        return apiKey.length === 39 && /^[A-Za-z0-9_-]+$/.test(apiKey);
      
      case 'serp':
        return apiKey.length >= 32 && /^[a-f0-9]+$/.test(apiKey);
      
      case 'serpstack':
        return apiKey.length === 32 && /^[a-f0-9]+$/.test(apiKey);
      
      case 'mistral':
        return apiKey.length >= 20;
      
      case 'lmstudio':
        return apiKey.length >= 8; // Local instances are more flexible
      
      default:
        return apiKey.length >= 8;
    }
  } catch (error) {
    console.error(`Error testing ${provider} API key:`, error);
    return false;
  }
}

/**
 * Enhanced API key testing with actual API calls (when available)
 * @param provider The API provider to test
 * @param apiKey The API key to test
 * @returns Promise<boolean> indicating if the key works
 */
export async function testApiKeyWithCall(provider: ApiProvider, apiKey: string): Promise<boolean> {
  try {
    // Try to use the api-proxy function if available
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: {
        service: provider,
        endpoint: 'test',
        apiKey
      }
    });

    if (error) {
      console.warn(`API proxy not available, falling back to format validation:`, error);
      return testApiKey(provider, apiKey);
    }

    return data?.success === true;
  } catch (error) {
    console.warn(`API proxy test failed, falling back to format validation:`, error);
    return testApiKey(provider, apiKey);
  }
}
