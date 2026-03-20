/**
 * Sync API keys from api_keys to ai_service_providers table
 * This ensures ai_service_providers has metadata records for configured providers.
 * NOTE: api_key column is always set to '' — edge functions decrypt from api_keys table directly.
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    available_models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    is_required: false,
    priority: 1
  },
  anthropic: {
    description: 'Constitutional AI for safe and helpful content creation',
    setup_url: 'https://console.anthropic.com/account/keys',
    icon_name: 'message-square',
    category: 'AI Services',
    capabilities: ['chat', 'completion', 'vision', 'analysis'],
    available_models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022'],
    is_required: false,
    priority: 2
  },
  gemini: {
    description: "Google's multimodal AI for diverse content tasks",
    setup_url: 'https://aistudio.google.com/app/apikey',
    icon_name: 'brain',
    category: 'AI Services',
    capabilities: ['chat', 'completion', 'vision', 'multimodal'],
    available_models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    is_required: false,
    priority: 3
  },
  mistral: {
    description: 'European AI provider with advanced language models',
    setup_url: 'https://console.mistral.ai/api-keys/',
    icon_name: 'binary',
    category: 'AI Services',
    capabilities: ['chat', 'completion', 'embedding'],
    available_models: ['mistral-large-latest', 'mistral-medium-latest'],
    is_required: false,
    priority: 4
  },
  openrouter: {
    description: 'Unified API for multiple AI models',
    setup_url: 'https://openrouter.ai/keys',
    icon_name: 'brain',
    category: 'AI Services',
    capabilities: ['chat', 'completion'],
    available_models: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet'],
    is_required: false,
    priority: 0
  }
};

/**
 * Sync API keys metadata to ai_service_providers.
 * Never writes plaintext keys — api_key is always ''.
 */
export async function syncApiKeysToProviders(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    console.log('🔄 Syncing API keys to ai_service_providers...');

    const { data: apiKeys, error: keysError } = await supabase
      .from('api_keys_metadata')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (keysError) throw new Error(`Failed to fetch API keys: ${keysError.message}`);
    if (!apiKeys || apiKeys.length === 0) {
      console.log('📭 No active API keys found to sync');
      return true;
    }

    const { data: existingProviders } = await supabase
      .from('ai_service_providers')
      .select('provider')
      .eq('user_id', user.id);

    const existingSet = new Set((existingProviders || []).map(p => p.provider));

    const providersToInsert = apiKeys
      .filter(key => PROVIDER_METADATA[key.service] && !existingSet.has(key.service))
      .map(key => {
        const metadata = PROVIDER_METADATA[key.service];
        return {
          user_id: user.id,
          provider: key.service,
          api_key: '', // Never store plaintext — edge functions decrypt from api_keys
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
        };
      });

    if (providersToInsert.length === 0) {
      console.log('✅ All API keys already synced');
      return true;
    }

    const { error: insertError } = await supabase
      .from('ai_service_providers')
      .insert(providersToInsert);

    if (insertError) throw new Error(`Failed to sync providers: ${insertError.message}`);

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
