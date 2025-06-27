
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
 * Simple encryption for API keys (base64 + simple cipher)
 */
function encryptKey(key: string): string {
  try {
    const encoded = btoa(key);
    // Simple cipher - rotate each character
    return encoded.split('').map(char => 
      String.fromCharCode(char.charCodeAt(0) + 3)
    ).join('');
  } catch {
    return btoa(key); // Fallback to just base64
  }
}

/**
 * Simple decryption for API keys
 */
function decryptKey(encryptedKey: string): string {
  try {
    // Reverse the simple cipher
    const decoded = encryptedKey.split('').map(char => 
      String.fromCharCode(char.charCodeAt(0) - 3)
    ).join('');
    return atob(decoded);
  } catch {
    try {
      return atob(encryptedKey); // Fallback to just base64
    } catch {
      return encryptedKey; // Last resort
    }
  }
}

/**
 * Get API key for a specific provider from database
 */
export async function getApiKey(provider: ApiProvider): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('User not logged in while trying to retrieve API key');
      return null;
    }
    
    console.log(`🔍 Retrieving ${provider} API key from database`);

    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', provider)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching ${provider} API key:`, error);
      return null;
    }
    
    if (!data || !data.encrypted_key) {
      console.log(`No ${provider} API key found in database`);
      return null;
    }
    
    const decryptedKey = decryptKey(data.encrypted_key);
    console.log(`✅ ${provider} API key retrieved successfully`);
    
    return decryptedKey;
  } catch (error) {
    console.error(`Error fetching ${provider} API key:`, error);
    return null;
  }
}

/**
 * Save API key for a specific provider to database
 */
export async function saveApiKey(provider: ApiProvider, apiKey: string): Promise<boolean> {
  try {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API key cannot be empty');
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to save API keys');
    }
    
    const cleanKey = apiKey.trim();
    console.log(`💾 Saving ${provider} API key to database`);

    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service', provider)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const encrypted_key = encryptKey(cleanKey);

    if (existingKey) {
      // Update existing key
      const { error } = await supabase
        .from('api_keys')
        .update({ 
          encrypted_key, 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingKey.id);

      if (error) throw error;
    } else {
      // Insert new key
      const { error } = await supabase
        .from('api_keys')
        .insert({ 
          service: provider, 
          encrypted_key, 
          is_active: true,
          user_id: user.id
        });

      if (error) throw error;
    }

    console.log(`✅ ${provider} API key saved successfully`);
    return true;
  } catch (error: any) {
    console.error(`Error saving ${provider} API key:`, error);
    return false;
  }
}

/**
 * Test API key for a specific provider
 */
export async function testApiKey(provider: ApiProvider, apiKey: string): Promise<boolean> {
  try {
    console.log(`🧪 Testing ${provider} API key`);
    
    // Simple validation based on known patterns
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
        return apiKey.length >= 8; // More flexible for local instances
      default:
        return apiKey.length >= 8;
    }
  } catch (error: any) {
    console.error(`Error testing ${provider} API key:`, error);
    return false;
  }
}

/**
 * Delete API key for a specific provider
 */
export async function deleteApiKey(provider: ApiProvider): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('You must be logged in to delete API keys');
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('service', provider)
      .eq('user_id', user.id);

    if (error) throw error;
    
    console.log(`🗑️ ${provider} API key deleted successfully`);
    return true;
  } catch (error: any) {
    console.error('Error deleting API key:', error);
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
  const providers: ApiProvider[] = ['serp', 'serpstack', 'openai', 'anthropic', 'gemini', 'mistral', 'lmstudio'];
  const status: Record<ApiProvider, boolean> = {} as Record<ApiProvider, boolean>;

  for (const provider of providers) {
    status[provider] = await hasApiKey(provider);
  }

  return status;
}
