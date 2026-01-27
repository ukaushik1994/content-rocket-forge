  /**
   * Sync API keys from api_keys to ai_service_providers table
   * This ensures AIServiceController can access the API keys saved in settings
   */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserApiKey {
  id: string;
  service: string;
  encrypted_key: string;
  is_active: boolean;
}

interface ProviderMetadata {
  description: string;
  setup_url: string;
  icon_name: string;
  category: string;
  capabilities: string[];
  available_models: string[];
  is_required: boolean;
  priority: number;
}

const PROVIDER_METADATA: Record<string, ProviderMetadata> = {
  openai: {
    description: 'Advanced AI models for content generation and analysis',
    setup_url: 'https://platform.openai.com/api-keys',
    icon_name: 'brain',
    category: 'AI Services',
    capabilities: ['chat', 'completion', 'vision', 'embedding'],
    available_models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    is_required: false,
    priority: 1
  },
  anthropic: {
    description: 'Constitutional AI for safe and helpful content creation',
    setup_url: 'https://console.anthropic.com/account/keys',
    icon_name: 'message-square',
    category: 'AI Services',
    capabilities: ['chat', 'completion', 'vision', 'analysis'],
    available_models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    is_required: false,
    priority: 2
  },
  gemini: {
    description: 'Google\'s multimodal AI for diverse content tasks',
    setup_url: 'https://aistudio.google.com/app/apikey',
    icon_name: 'brain',
    category: 'AI Services',
    capabilities: ['chat', 'completion', 'vision', 'multimodal'],
    available_models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro-vision'],
    is_required: false,
    priority: 3
  },
  mistral: {
    description: 'European AI provider with advanced language models',
    setup_url: 'https://console.mistral.ai/api-keys/',
    icon_name: 'binary',
    category: 'AI Services',
    capabilities: ['chat', 'completion', 'embedding'],
    available_models: ['mistral-large', 'mistral-medium', 'mistral-small'],
    is_required: false,
    priority: 4
  },
  lmstudio: {
    description: 'Local AI models running on your machine',
    setup_url: 'https://lmstudio.ai/',
    icon_name: 'server',
    category: 'AI Services',
    capabilities: ['chat', 'completion', 'local'],
    available_models: ['llama-3.2', 'phi-3', 'codellama'],
    is_required: false,
    priority: 5
  }
};

/**
 * Sync API keys from user_llm_keys to ai_service_providers
 */
export async function syncApiKeysToProviders(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('🔄 Syncing API keys to ai_service_providers...');

    // Get API key metadata (encrypted_key not accessible from client for security)
    const { data: apiKeys, error: keysError } = await supabase
      .from('api_keys_metadata')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (keysError) {
      throw new Error(`Failed to fetch API keys: ${keysError.message}`);
    }

    if (!apiKeys || apiKeys.length === 0) {
      console.log('📭 No active API keys found to sync');
      return true;
    }

    console.log(`📦 Found ${apiKeys.length} API keys to sync`);

    // Get existing providers to avoid duplicates
    const { data: existingProviders, error: providersError } = await supabase
      .from('ai_service_providers')
      .select('provider')
      .eq('user_id', user.id);

    if (providersError) {
      throw new Error(`Failed to fetch existing providers: ${providersError.message}`);
    }

    const existingProviderNames = new Set(
      (existingProviders || []).map(p => p.provider)
    );

    // Prepare provider data for insertion - decrypt keys first
    const providersToInsert = [];
    
    for (const key of apiKeys) {
      if (!PROVIDER_METADATA[key.service] || existingProviderNames.has(key.service)) {
        continue;
      }
      
      try {
        // Decrypt the API key
        const { getApiKey } = await import('../apiKeyService');
        const decryptedKey = await getApiKey(key.service as any);
        
        if (!decryptedKey) {
          console.warn(`Could not decrypt API key for ${key.service}`);
          continue;
        }
        
        const metadata = PROVIDER_METADATA[key.service];
        providersToInsert.push({
          user_id: user.id,
          provider: key.service,
          api_key: decryptedKey,
          status: 'active',
          priority: metadata.priority,
          description: metadata.description,
          setup_url: metadata.setup_url,
          icon_name: metadata.icon_name,
          category: metadata.category,
          capabilities: metadata.capabilities,
          available_models: metadata.available_models,
          is_required: metadata.is_required,
          last_verified: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Failed to decrypt key for ${key.service}:`, error);
      }
    }

    if (providersToInsert.length === 0) {
      console.log('✅ All API keys already synced');
      return true;
    }

    // Insert providers
    const { error: insertError } = await supabase
      .from('ai_service_providers')
      .insert(providersToInsert);

    if (insertError) {
      throw new Error(`Failed to sync providers: ${insertError.message}`);
    }

    console.log(`✅ Successfully synced ${providersToInsert.length} providers`);
    toast.success(`Synced ${providersToInsert.length} AI providers`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to sync API keys:', error);
    toast.error(`Failed to sync API keys: ${error.message}`);
    return false;
  }
}

/**
 * Auto-sync API keys when AIServiceController is initialized
 */
export async function autoSyncApiKeys(): Promise<void> {
  try {
    // Check if we need to sync (if ai_service_providers is empty but user_llm_keys has data)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [providersResult, keysResult] = await Promise.all([
      supabase.from('ai_service_providers').select('id').eq('user_id', user.id).limit(1),
      supabase.from('api_keys_metadata').select('id').eq('user_id', user.id).eq('is_active', true).limit(1)
    ]);

    const hasProviders = (providersResult.data || []).length > 0;
    const hasKeys = (keysResult.data || []).length > 0;

    if (!hasProviders && hasKeys) {
      console.log('🚀 Auto-syncing API keys...');
      await syncApiKeysToProviders();
    }
  } catch (error) {
    console.error('Auto-sync failed:', error);
  }
}