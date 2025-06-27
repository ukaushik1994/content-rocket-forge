
import { supabase } from '@/integrations/supabase/client';

export type ApiProvider = 'serp' | 'serpstack' | 'openai' | 'anthropic' | 'gemini';

const API_KEY_MAPPING: Record<ApiProvider, string> = {
  serp: 'SERP_API_KEY',
  serpstack: 'SERPSTACK_API_KEY',
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  gemini: 'GEMINI_API_KEY'
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
  const providers: ApiProvider[] = ['serp', 'serpstack', 'openai', 'anthropic', 'gemini'];
  const status: Record<ApiProvider, boolean> = {} as Record<ApiProvider, boolean>;

  for (const provider of providers) {
    status[provider] = await hasApiKey(provider);
  }

  return status;
}
