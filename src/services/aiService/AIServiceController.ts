import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIProvider {
  id: string;
  provider: string;
  api_key: string;
  preferred_model?: string;
  priority: number;
  status: 'active' | 'inactive' | 'error';
  last_verified?: string;
  error_message?: string;
  description?: string;
  setup_url?: string;
  icon_name?: string;
  category?: string;
  capabilities?: string[];
  available_models?: string[];
  is_required?: boolean;
}

export interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  category: string;
  setup_url: string;
  capabilities: string[];
  available_models: string[];
  is_required: boolean;
  status?: 'active' | 'inactive' | 'error';
  is_configured?: boolean;
  last_verified?: string;
}

export interface AIGenerateRequest {
  input: string;
  use_case: 'title_generation' | 'outline_generation' | 'content_generation' | 'repurpose' | 'chat' | 'strategy';
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

export interface AIGenerateResponse {
  content: string;
  provider_used: string;
  model_used: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

class AIServiceController {
  private static instance: AIServiceController;
  private providersCache: AIProvider[] = [];
  private lastCacheUpdate = 0;
  private readonly CACHE_TTL = 30000; // 30 seconds

  // Provider metadata registry
  private static readonly PROVIDER_METADATA: Record<string, Omit<ProviderInfo, 'id' | 'status' | 'is_configured' | 'last_verified'>> = {
    openrouter: {
      name: 'OpenRouter',
      description: 'Access multiple AI models through a single API gateway',
      icon_name: 'brain',
      category: 'AI Services',
      setup_url: 'https://openrouter.ai/keys',
      capabilities: ['chat', 'completion', 'multimodal'],
      available_models: ['gpt-4.1-2025-04-14', 'claude-opus-4-20250514', 'claude-sonnet-4-20250514'],
      is_required: false
    },
    openai: {
      name: 'OpenAI',
      description: 'Advanced AI models for content generation and analysis',
      icon_name: 'brain',
      category: 'AI Services',
      setup_url: 'https://platform.openai.com/api-keys',
      capabilities: ['chat', 'completion', 'vision', 'embedding'],
      available_models: ['gpt-4.1-2025-04-14', 'o3-2025-04-16', 'o4-mini-2025-04-16'],
      is_required: false
    },
    anthropic: {
      name: 'Anthropic Claude',
      description: 'Constitutional AI for safe and helpful content creation',
      icon_name: 'message-square',
      category: 'AI Services',
      setup_url: 'https://console.anthropic.com/account/keys',
      capabilities: ['chat', 'completion', 'vision', 'analysis'],
      available_models: ['claude-opus-4-20250514', 'claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
      is_required: false
    },
    gemini: {
      name: 'Google Gemini',
      description: 'Google\'s multimodal AI for diverse content tasks',
      icon_name: 'brain',
      category: 'AI Services',
      setup_url: 'https://aistudio.google.com/app/apikey',
      capabilities: ['chat', 'completion', 'vision', 'multimodal'],
      available_models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro-vision'],
      is_required: false
    },
    mistral: {
      name: 'Mistral AI',
      description: 'European AI provider with advanced language models',
      icon_name: 'binary',
      category: 'AI Services',
      setup_url: 'https://console.mistral.ai/api-keys/',
      capabilities: ['chat', 'completion', 'embedding'],
      available_models: ['mistral-large', 'mistral-medium', 'mistral-small'],
      is_required: false
    },
    lmstudio: {
      name: 'LM Studio',
      description: 'Local AI models running on your machine',
      icon_name: 'server',
      category: 'AI Services',
      setup_url: 'https://lmstudio.ai/',
      capabilities: ['chat', 'completion', 'local'],
      available_models: ['llama-3.2', 'phi-3', 'codellama'],
      is_required: false
    },
    serp: {
      name: 'SERP API',
      description: 'Search Engine Results Page data for SEO analysis',
      icon_name: 'search',
      category: 'SEO & Analytics',
      setup_url: 'https://serpapi.com/manage-api-key',
      capabilities: ['search', 'seo'],
      available_models: [],
      is_required: true
    },
    serpstack: {
      name: 'Serpstack',
      description: 'Alternative SERP data provider for comprehensive search analysis',
      icon_name: 'search',
      category: 'SEO & Analytics',
      setup_url: 'https://serpstack.com/dashboard',
      capabilities: ['search', 'seo'],
      available_models: [],
      is_required: false
    }
  };

  static getInstance(): AIServiceController {
    if (!AIServiceController.instance) {
      AIServiceController.instance = new AIServiceController();
    }
    return AIServiceController.instance;
  }

  /**
   * Check if AI service is globally enabled
   */
  async isAIServiceEnabled(): Promise<boolean> {
    try {
      // Dynamic import to avoid circular dependency
      const { getUserPreference } = await import('@/services/userPreferencesService');
      
      // Check user preference (default to true if not set)
      const isEnabled = getUserPreference('enableAiService');
      if (isEnabled === false) {
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // AI is enabled if user hasn't disabled it and at least one provider is configured
      const providers = await this.getActiveProviders();
      return providers.length > 0;
    } catch (error) {
      console.error('Error checking AI service status:', error);
      return false;
    }
  }

  /**
   * Get active providers sorted by priority
   */
  async getActiveProviders(): Promise<AIProvider[]> {
    const now = Date.now();
    
    // Return cached providers if still valid
    if (this.providersCache.length > 0 && (now - this.lastCacheUpdate) < this.CACHE_TTL) {
      return this.providersCache;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('ai_service_providers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('priority', { ascending: true });

      if (error) {
        console.error('Failed to fetch AI providers:', error);
        return [];
      }

      this.providersCache = (data || []).map(p => ({
        ...p,
        status: p.status as 'active' | 'inactive' | 'error'
      }));
      this.lastCacheUpdate = now;
      
      return this.providersCache;
    } catch (error) {
      console.error('Error getting active providers:', error);
      return [];
    }
  }

  /**
   * Get all providers (configured and unconfigured) with metadata
   */
  async getAllProviders(): Promise<ProviderInfo[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return Object.entries(AIServiceController.PROVIDER_METADATA).map(([id, metadata]) => ({
          id,
          ...metadata,
          status: 'inactive',
          is_configured: false
        }));
      }

      const { data: configuredProviders, error } = await supabase
        .from('ai_service_providers')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to fetch configured providers:', error);
      }

      const configuredMap = new Map(
        (configuredProviders || []).map(p => [p.provider, p])
      );

      return Object.entries(AIServiceController.PROVIDER_METADATA).map(([providerId, metadata]) => {
        const configured = configuredMap.get(providerId);
        return {
          id: providerId,
          ...metadata,
          status: (configured?.status as 'active' | 'inactive' | 'error') || 'inactive',
          is_configured: !!configured,
          last_verified: configured?.last_verified
        };
      });
    } catch (error) {
      console.error('Error fetching all providers:', error);
      return Object.entries(AIServiceController.PROVIDER_METADATA).map(([id, metadata]) => ({
        id,
        ...metadata,
        status: 'inactive',
        is_configured: false
      }));
    }
  }

  /**
   * Get provider metadata by ID
   */
  getProviderInfo(providerId: string): ProviderInfo | null {
    const metadata = AIServiceController.PROVIDER_METADATA[providerId];
    if (!metadata) {
      return null;
    }

    return {
      id: providerId,
      ...metadata,
      status: 'inactive',
      is_configured: false
    };
  }

  /**
   * Main generation function that handles fallback logic
   */
  async generate(
    useCaseOrRequest: string | AIGenerateRequest,
    systemPrompt?: string,
    userPrompt?: string,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<any> {
    // Handle both old and new signatures
    let request: AIGenerateRequest;
    
    if (typeof useCaseOrRequest === 'string') {
      // New signature: generate(useCase, systemPrompt, userPrompt, options)
      request = {
        input: userPrompt || '',
        use_case: useCaseOrRequest as any,
        temperature: options?.temperature,
        max_tokens: options?.maxTokens
      };
    } else {
      // Old signature: generate(request)
      request = useCaseOrRequest;
    }
    // Check if AI service is globally enabled by user preference
    const { getUserPreference } = await import('@/services/userPreferencesService');
    const isServiceEnabled = getUserPreference('enableAiService');
    
    if (isServiceEnabled === false) {
      toast.error('AI service is disabled. Enable it in Settings to use AI features.');
      return null;
    }

    const providers = await this.getActiveProviders();
    if (providers.length === 0) {
      toast.error('No AI providers configured. Please configure at least one provider in Settings.');
      return null;
    }

    const errors: string[] = [];

    // Try each provider in order of priority
    for (const provider of providers) {
      try {
        console.log(`🎯 Attempting to use ${provider.provider} for ${request.use_case}`);
        
        const result = await this.callProvider(provider, request, systemPrompt);
        
        if (result && result.content) {
          console.log(`✅ Successfully generated content using ${provider.provider}`);
          
          // Update provider status to active if successful
          await this.updateProviderStatus(provider.id, 'active');
          
          return {
            ...result,
            provider_used: provider.provider,
            model_used: provider.preferred_model || this.getDefaultModel(provider.provider)
          };
        }
      } catch (error: any) {
        console.warn(`❌ Provider ${provider.provider} failed:`, error.message);
        errors.push(`${provider.provider}: ${error.message}`);
        
        // Update provider status to error
        await this.updateProviderStatus(provider.id, 'error', error.message);
        
        continue; // Try next provider
      }
    }

    // All providers failed
    console.error('🚫 All AI providers failed:', errors);
    toast.error('AI generation failed. All configured providers are currently unavailable.');
    
    return null;
  }

  /**
   * Call a specific provider
   */
  private async callProvider(provider: AIProvider, request: AIGenerateRequest, customSystemPrompt?: string): Promise<any> {
    try {
      const systemPrompt = customSystemPrompt || this.getSystemPrompt(request.use_case);
      
      const { data, error } = await supabase.functions.invoke('ai-proxy', {
        body: {
          provider: provider.provider,
          endpoint: 'chat',
          params: {
            model: request.model || provider.preferred_model || this.getDefaultModel(provider.provider),
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: request.input }
            ],
            temperature: request.temperature || 0.7,
            max_tokens: request.max_tokens || 2000
          },
          apiKey: provider.api_key
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No response from AI proxy');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Extract content from response
      let content = '';
      if (data.choices && data.choices[0]?.message?.content) {
        content = data.choices[0].message.content;
      } else if (data.content) {
        content = data.content;
      } else if (typeof data === 'string') {
        content = data;
      } else {
        throw new Error('Unexpected response format from AI provider');
      }

      return {
        content,
        usage: data.usage
      };
    } catch (error: any) {
      console.error(`Error calling ${provider.provider}:`, error);
      throw error;
    }
  }

  /**
   * Update provider status in database
   */
  async updateProviderStatus(providerId: string, status: 'active' | 'inactive' | 'error', errorMessage?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('ai_service_providers')
        .update({ 
          status, 
          error_message: errorMessage,
          last_verified: new Date().toISOString()
        })
        .eq('id', providerId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to update provider status:', error);
      }

      // Clear cache
      this.clearCache();
    } catch (error) {
      console.error('Error updating provider status:', error);
    }
  }

  /**
   * Clear providers cache
   */
  clearCache(): void {
    this.providersCache = [];
    this.lastCacheUpdate = 0;
  }

  /**
   * Get system prompt for specific use case
   */
  private getSystemPrompt(useCase: string): string {
    const prompts = {
      title_generation: "You are an expert content creator. Generate compelling, SEO-friendly titles that capture attention and accurately represent the content topic.",
      outline_generation: "You are an expert content strategist. Create detailed, well-structured outlines that provide a clear framework for comprehensive content creation.",
      content_generation: "You are an expert content writer. Create high-quality, engaging, and informative content that provides value to readers and follows SEO best practices.",
      repurpose: "You are an expert content repurposing specialist. Transform the given content into the requested format while maintaining key information and adapting the tone appropriately.",
      chat: "You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user queries.",
      strategy: "You are an expert content strategist. Analyze the given information and provide strategic recommendations for content creation and marketing."
    };

    return prompts[useCase as keyof typeof prompts] || prompts.chat;
  }

  /**
   * Get default model for a provider
   */
  getDefaultModel(provider: string): string {
    const defaults = {
      openrouter: 'gpt-4.1-2025-04-14',
      openai: 'gpt-4.1-2025-04-14',
      anthropic: 'claude-opus-4-20250514',
      gemini: 'gemini-1.5-pro',
      mistral: 'mistral-large',
      lmstudio: 'llama-3.2'
    };

    return defaults[provider as keyof typeof defaults] || 'gpt-4.1-2025-04-14';
  }

  /**
   * Validate provider configuration
   */
  async validateProvider(provider: string, apiKey: string, model?: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-proxy', {
        body: {
          provider,
          endpoint: 'test',
          apiKey
        }
      });

      if (error) {
        return { valid: false, error: error.message };
      }

      if (data && data.valid) {
        return { valid: true };
      }

      return { valid: false, error: data?.error || 'Validation failed' };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Test provider connection
   */
  async testProvider(provider: string, apiKey: string): Promise<boolean> {
    const result = await this.validateProvider(provider, apiKey);
    return result.valid;
  }

  /**
   * Add a new AI provider with metadata
   */
  async addProvider(providerData: {
    provider: string;
    api_key: string;
    preferred_model?: string;
    priority: number;
  }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const metadata = AIServiceController.PROVIDER_METADATA[providerData.provider];
      if (!metadata) {
        throw new Error(`Unknown provider: ${providerData.provider}`);
      }

      const { error } = await supabase
        .from('ai_service_providers')
        .insert({
          user_id: user.id,
          provider: providerData.provider,
          api_key: providerData.api_key,
          preferred_model: providerData.preferred_model,
          priority: providerData.priority,
          status: 'active',
          description: metadata.description,
          setup_url: metadata.setup_url,
          icon_name: metadata.icon_name,
          category: metadata.category,
          capabilities: metadata.capabilities,
          available_models: metadata.available_models,
          is_required: metadata.is_required
        });

      if (error) {
        throw error;
      }

      // Clear cache to force refresh
      this.clearCache();
    } catch (error) {
      console.error('Failed to add provider:', error);
      throw error;
    }
  }

  /**
   * Update an existing provider
   */
  async updateProvider(providerId: string, updates: Partial<{
    priority: number;
    preferred_model: string;
    status: string;
    error_message: string;
  }>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('ai_service_providers')
        .update(updates)
        .eq('id', providerId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Clear cache
      this.clearCache();
    } catch (error) {
      console.error('Failed to update provider:', error);
      throw error;
    }
  }

  /**
   * Delete a provider
   */
  async deleteProvider(providerId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('ai_service_providers')
        .delete()
        .eq('id', providerId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Clear cache
      this.clearCache();
    } catch (error) {
      console.error('Failed to delete provider:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default AIServiceController.getInstance();