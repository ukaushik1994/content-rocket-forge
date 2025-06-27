
import { supabase } from '@/integrations/supabase/client';

export type ApiProvider = 'serp' | 'serpstack' | 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'lmstudio';

const API_KEY_MAPPING: Record<ApiProvider, string> = {
  serp: 'SERP_API_KEY',
  serpstack: 'SERPSTACK_API_KEY',
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  gemini: 'GEMINI_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  lmstudio: 'LMSTUDIO_API_KEY'
};

/**
 * Get API key for a specific provider from Supabase secrets
 */
export async function getApiKey(provider: ApiProvider): Promise<string | null> {
  try {
    const secretName = API_KEY_MAPPING[provider];
    
    if (!secretName) {
      console.error(`❌ Unknown provider: ${provider}`);
      return null;
    }

    // Try to get from Supabase secrets via edge function
    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { secretName }
    });

    if (error) {
      console.warn(`⚠️ Could not fetch ${provider} API key from secrets:`, error);
      return null;
    }

    if (data?.value) {
      console.log(`✅ ${provider.toUpperCase()} API key found in secrets`);
      return data.value;
    }

    console.warn(`⚠️ No ${provider.toUpperCase()} API key found`);
    return null;
  } catch (error) {
    console.error(`❌ Error getting ${provider} API key:`, error);
    return null;
  }
}

/**
 * Save API key for a specific provider to Supabase secrets
 */
export async function saveApiKey(provider: ApiProvider, apiKey: string): Promise<boolean> {
  try {
    const secretName = API_KEY_MAPPING[provider];
    
    if (!secretName) {
      console.error(`❌ Unknown provider: ${provider}`);
      return false;
    }

    const { data, error } = await supabase.functions.invoke('save-secret', {
      body: { secretName, value: apiKey }
    });

    if (error) {
      console.error(`❌ Error saving ${provider} API key:`, error);
      return false;
    }

    console.log(`✅ ${provider.toUpperCase()} API key saved successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving ${provider} API key:`, error);
    return false;
  }
}

/**
 * Test API key for a specific provider
 */
export async function testApiKey(provider: ApiProvider, apiKey: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: {
        service: provider,
        endpoint: 'test',
        apiKey
      }
    });

    if (error) {
      console.error(`❌ Error testing ${provider} API key:`, error);
      return false;
    }

    return data?.success === true;
  } catch (error) {
    console.error(`❌ Error testing ${provider} API key:`, error);
    return false;
  }
}

/**
 * Delete API key for a specific provider
 */
export async function deleteApiKey(provider: ApiProvider): Promise<boolean> {
  try {
    const secretName = API_KEY_MAPPING[provider];
    
    if (!secretName) {
      console.error(`❌ Unknown provider: ${provider}`);
      return false;
    }

    const { data, error } = await supabase.functions.invoke('delete-secret', {
      body: { secretName }
    });

    if (error) {
      console.error(`❌ Error deleting ${provider} API key:`, error);
      return false;
    }

    console.log(`✅ ${provider.toUpperCase()} API key deleted successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting ${provider} API key:`, error);
    return false;
  }
}

/**
 * Detect API key type based on format
 */
export function detectApiKeyType(apiKey: string): ApiProvider | null {
  if (!apiKey) return null;
  
  // OpenAI keys start with 'sk-'
  if (apiKey.startsWith('sk-')) {
    return 'openai';
  }
  
  // Anthropic keys start with 'sk-ant-'
  if (apiKey.startsWith('sk-ant-')) {
    return 'anthropic';
  }
  
  // Gemini keys are typically 39 characters
  if (apiKey.length === 39 && /^[A-Za-z0-9_-]+$/.test(apiKey)) {
    return 'gemini';
  }
  
  // SerpAPI keys are typically 64 characters
  if (apiKey.length === 64 && /^[a-f0-9]+$/.test(apiKey)) {
    return 'serp';
  }
  
  // Serpstack keys are typically alphanumeric
  if (apiKey.length === 32 && /^[a-f0-9]+$/.test(apiKey)) {
    return 'serpstack';
  }
  
  return null;
}

/**
 * Test if API key exists for a provider
 */
export async function hasApiKey(provider: ApiProvider): Promise<boolean> {
  const key = await getApiKey(provider);
  return !!key;
}

/**
 * Get all configured API keys status
 */
export async function getApiKeysStatus() {
  const providers: ApiProvider[] = ['serp', 'serpstack', 'openai', 'anthropic', 'gemini', 'mistral'];
  const status: Record<ApiProvider, boolean> = {} as Record<ApiProvider, boolean>;

  for (const provider of providers) {
    status[provider] = await hasApiKey(provider);
  }

  return status;
}
