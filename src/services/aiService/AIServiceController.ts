import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AiProvider } from './types';

export interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
  status: 'active' | 'error' | 'inactive';
  priority: number;
  preferred_model?: string;
  error_message?: string;
  last_verified?: string;
  is_configured: boolean;
  is_required: boolean;
  capabilities: string[];
  setup_url: string;
  icon_name: string;
  category: string;
  available_models: string[];
  api_key?: string;
}

interface GenerateParams {
  input: string;
  use_case: string;
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

// Ensure GenerateResult includes optional provider_used/model_used for compatibility
interface GenerateResult {
  content: string;
  provider_used?: string;
  model_used?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

class AIServiceController {
  private static providerCache: ProviderInfo[] | null = null;
  private static cacheTimestamp: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all active providers for the current user
   */
  static async getActiveProviders(): Promise<ProviderInfo[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.warn('User not authenticated for getActiveProviders');
        return [];
      }

      const { data, error } = await supabase
        .from('ai_service_providers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('priority', { ascending: true });

      if (error) {
        console.error('Error fetching active providers:', error);
        return [];
      }

      return data?.map(this.mapDatabaseRowToProviderInfo) || [];
    } catch (error) {
      console.error('Error in getActiveProviders:', error);
      return [];
    }
  }

  /**
   * Get all available providers (configured and unconfigured)
   */
  static async getAllProviders(): Promise<ProviderInfo[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.providerCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.providerCache;
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.warn('User not authenticated for getAllProviders');
        return this.getDefaultProviders();
      }

      // Get user's configured providers
      const { data: userProviders, error } = await supabase
        .from('ai_service_providers')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user providers:', error);
        return this.getDefaultProviders();
      }

      // Merge with default providers
      const defaultProviders = this.getDefaultProviders();
      const configuredProviderIds = new Set(userProviders?.map(p => p.provider) || []);

      const allProviders = [
        // User's configured providers
        ...(userProviders?.map(this.mapDatabaseRowToProviderInfo) || []),
        // Default providers that aren't configured
        ...defaultProviders.filter(p => !configuredProviderIds.has(p.id))
      ];

      // Cache the result
      this.providerCache = allProviders;
      this.cacheTimestamp = now;

      return allProviders;
    } catch (error) {
      console.error('Error in getAllProviders:', error);
      return this.getDefaultProviders();
    }
  }

  /**
   * Get default provider definitions
   */
  private static getDefaultProviders(): ProviderInfo[] {
    return [
      {
        id: 'openrouter',
        name: 'OpenRouter',
        description: 'Access to multiple AI models through one API',
        provider: 'openrouter',
        status: 'inactive',
        priority: 1,
        is_configured: false,
        is_required: false,
        capabilities: ['text-generation', 'chat', 'reasoning'],
        setup_url: 'https://openrouter.ai/keys',
        icon_name: 'brain',
        category: 'ai',
        available_models: ['gpt-4o-mini', 'claude-3-haiku', 'llama-3.1-8b']
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        description: 'Claude models for reasoning and analysis',
        provider: 'anthropic',
        status: 'inactive',
        priority: 2,
        is_configured: false,
        is_required: false,
        capabilities: ['text-generation', 'chat', 'reasoning'],
        setup_url: 'https://console.anthropic.com/',
        icon_name: 'message-square',
        category: 'ai',
        available_models: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus']
      },
      {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT models for text generation',
        provider: 'openai',
        status: 'inactive',
        priority: 3,
        is_configured: false,
        is_required: false,
        capabilities: ['text-generation', 'chat', 'reasoning'],
        setup_url: 'https://platform.openai.com/api-keys',
        icon_name: 'brain',
        category: 'ai',
        available_models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        description: 'Google\'s advanced AI models',
        provider: 'gemini',
        status: 'inactive',
        priority: 4,
        is_configured: false,
        is_required: false,
        capabilities: ['text-generation', 'chat', 'reasoning'],
        setup_url: 'https://makersuite.google.com/app/apikey',
        icon_name: 'binary',
        category: 'ai',
        available_models: ['gemini-pro', 'gemini-pro-vision']
      },
      {
        id: 'mistral',
        name: 'Mistral AI',
        description: 'Open and efficient AI models',
        provider: 'mistral',
        status: 'inactive',
        priority: 5,
        is_configured: false,
        is_required: false,
        capabilities: ['text-generation', 'chat'],
        setup_url: 'https://console.mistral.ai/',
        icon_name: 'server',
        category: 'ai',
        available_models: ['mistral-tiny', 'mistral-small', 'mistral-medium']
      },
      {
        id: 'lmstudio',
        name: 'LM Studio',
        description: 'Local AI models via LM Studio',
        provider: 'lmstudio',
        status: 'inactive',
        priority: 6,
        is_configured: false,
        is_required: false,
        capabilities: ['text-generation', 'chat'],
        setup_url: 'https://lmstudio.ai/',
        icon_name: 'server',
        category: 'ai',
        available_models: []
      }
    ];
  }

  /**
   * Map database row to ProviderInfo interface
   */
  private static mapDatabaseRowToProviderInfo(row: any): ProviderInfo {
    return {
      id: row.provider,
      name: row.name || this.getProviderDisplayName(row.provider),
      description: row.description || this.getProviderDescription(row.provider),
      provider: row.provider,
      status: row.status || 'inactive',
      priority: row.priority || 999,
      preferred_model: row.preferred_model,
      error_message: row.error_message,
      last_verified: row.last_verified,
      is_configured: true,
      is_required: row.is_required || false,
      capabilities: row.capabilities || this.getProviderCapabilities(row.provider),
      setup_url: row.setup_url || this.getProviderSetupUrl(row.provider),
      icon_name: row.icon_name || this.getProviderIcon(row.provider),
      category: row.category || 'ai',
      available_models: row.available_models || this.getProviderModels(row.provider),
      api_key: row.api_key
    };
  }

  private static getProviderDisplayName(provider: string): string {
    const names: Record<string, string> = {
      openrouter: 'OpenRouter',
      anthropic: 'Anthropic',
      openai: 'OpenAI',
      gemini: 'Google Gemini',
      mistral: 'Mistral AI',
      lmstudio: 'LM Studio'
    };
    return names[provider] || provider;
  }

  private static getProviderDescription(provider: string): string {
    const descriptions: Record<string, string> = {
      openrouter: 'Access to multiple AI models through one API',
      anthropic: 'Claude models for reasoning and analysis',
      openai: 'GPT models for text generation',
      gemini: 'Google\'s advanced AI models',
      mistral: 'Open and efficient AI models',
      lmstudio: 'Local AI models via LM Studio'
    };
    return descriptions[provider] || 'AI provider';
  }

  private static getProviderCapabilities(provider: string): string[] {
    const capabilities: Record<string, string[]> = {
      openrouter: ['text-generation', 'chat', 'reasoning'],
      anthropic: ['text-generation', 'chat', 'reasoning'],
      openai: ['text-generation', 'chat', 'reasoning'],
      gemini: ['text-generation', 'chat', 'reasoning'],
      mistral: ['text-generation', 'chat'],
      lmstudio: ['text-generation', 'chat']
    };
    return capabilities[provider] || ['text-generation'];
  }

  private static getProviderSetupUrl(provider: string): string {
    const urls: Record<string, string> = {
      openrouter: 'https://openrouter.ai/keys',
      anthropic: 'https://console.anthropic.com/',
      openai: 'https://platform.openai.com/api-keys',
      gemini: 'https://makersuite.google.com/app/apikey',
      mistral: 'https://console.mistral.ai/',
      lmstudio: 'https://lmstudio.ai/'
    };
    return urls[provider] || '#';
  }

  private static getProviderIcon(provider: string): string {
    const icons: Record<string, string> = {
      openrouter: 'brain',
      anthropic: 'message-square',
      openai: 'brain',
      gemini: 'binary',
      mistral: 'server',
      lmstudio: 'server'
    };
    return icons[provider] || 'brain';
  }

  private static getProviderModels(provider: string): string[] {
    const models: Record<string, string[]> = {
      openrouter: ['gpt-4o-mini', 'claude-3-haiku', 'llama-3.1-8b'],
      anthropic: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
      openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
      gemini: ['gemini-pro', 'gemini-pro-vision'],
      mistral: ['mistral-tiny', 'mistral-small', 'mistral-medium'],
      lmstudio: []
    };
    return models[provider] || [];
  }

  /**
   * Generate content using the best available provider
   *
   * Backwards-compatible overloads to support both positional and object params.
   */
  static async generate(params: {
    input: string;
    use_case: string;
    temperature?: number;
    max_tokens?: number;
    model?: string;
  }): Promise<GenerateResult | null>;
  static async generate(input: string, use_case: string): Promise<GenerateResult | null>;
  static async generate(input: string, use_case: string, temperature: number): Promise<GenerateResult | null>;
  static async generate(input: string, use_case: string, temperature: number, max_tokens: number): Promise<GenerateResult | null>;
  static async generate(input: string, use_case: string, temperature: number, max_tokens: number, model: string): Promise<GenerateResult | null>;
  static async generate(...args: any[]): Promise<GenerateResult | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Normalize arguments into a single params object
      let normalized: GenerateParams;
      if (typeof args[0] === 'string') {
        const [input, use_case, temperature, max_tokens, model] = args;
        normalized = { input, use_case, temperature, max_tokens, model };
      } else {
        normalized = args[0] as GenerateParams;
      }

      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          ...normalized,
          userId: user.id
        }
      });

      if (error) {
        console.error('AI generation error:', error);
        throw new Error(error.message || 'AI generation failed');
      }

      return data as GenerateResult;
    } catch (error) {
      console.error('Error in generate:', error);
      throw error;
    }
  }

  // Update: make addProvider idempotent and show clearer errors
  static async addProvider(params: {
    provider: string;
    api_key: string;
    preferred_model?: string;
    priority?: number;
    capabilities?: string[]; // optional passthrough
    description?: string;    // optional passthrough
    setup_url?: string;      // optional passthrough
    icon_name?: string;      // optional passthrough
    category?: string;       // optional passthrough
    is_required?: boolean;   // optional passthrough
    available_models?: string[]; // optional passthrough
    status?: 'active' | 'inactive' | 'error'; // optional passthrough
  }) {
    const provider = params.provider?.trim().toLowerCase();
    const api_key = params.api_key?.trim();

    if (!provider) {
      throw new Error('Provider is required');
    }
    if (!api_key) {
      throw new Error('API key is required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('You must be signed in to add providers');
    }

    const row = {
      user_id: user.id,
      provider,
      api_key,
      preferred_model: params.preferred_model || null,
      priority: params.priority ?? 1,
      status: params.status ?? 'active',
      // Optional metadata columns (will be ignored if not present in schema)
      capabilities: params.capabilities ?? undefined,
      description: params.description ?? undefined,
      setup_url: params.setup_url ?? undefined,
      icon_name: params.icon_name ?? undefined,
      category: params.category ?? undefined,
      is_required: params.is_required ?? undefined,
      available_models: params.available_models ?? undefined,
      updated_at: new Date().toISOString(),
    };

    // Use UPSERT on (user_id, provider) to avoid duplicate key errors
    const { error } = await supabase
      .from('ai_service_providers')
      .upsert(row, {
        onConflict: 'user_id,provider',
        ignoreDuplicates: false,
      });

    if (error) {
      // Bubble up the actual DB error message so UI can show it
      throw new Error(error.message || 'Failed to save provider');
    }

    // Clear cache to force refresh
    this.providerCache = null;
    this.cacheTimestamp = 0;
    
    return true;
  }

  /**
   * Update an existing provider
   */
  static async updateProvider(providerId: string, updates: Partial<{
    status: string;
    priority: number;
    preferred_model: string;
    api_key: string;
  }>): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('ai_service_providers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', providerId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      // Clear cache
      this.providerCache = null;
      this.cacheTimestamp = 0;
    } catch (error) {
      console.error('Error updating provider:', error);
      throw error;
    }
  }

  /**
   * Delete a provider
   */
  static async deleteProvider(providerId: string): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('ai_service_providers')
        .delete()
        .eq('id', providerId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      // Clear cache
      this.providerCache = null;
      this.cacheTimestamp = 0;
    } catch (error) {
      console.error('Error deleting provider:', error);
      throw error;
    }
  }

  /**
   * Test a provider's API key
   */
  static async testProvider(provider: string, apiKey: string): Promise<boolean> {
    try {
      const result = await this.generate({
        input: 'Test',
        use_case: 'test',
        temperature: 0.1,
        max_tokens: 10
      });
      return !!result?.content;
    } catch (error) {
      console.error('Provider test failed:', error);
      return false;
    }
  }

  /**
   * Backwards-compatible helper expected by some components.
   * Returns true if the AI service is enabled and at least one provider is available.
   */
  static async isAIServiceEnabled(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const providers = await this.getAllProviders();
      return providers.length > 0;
    } catch (e) {
      console.warn('isAIServiceEnabled check failed:', e);
      return false;
    }
  }

  /**
   * Clear provider cache
   */
  static clearCache(): void {
    this.providerCache = null;
    this.cacheTimestamp = 0;
  }
}

export default AIServiceController;
