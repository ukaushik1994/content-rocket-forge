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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // For now, we'll consider AI enabled if any provider is configured
      // This can be extended to include a global toggle in user preferences
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
      if (!user) return [];

      const { data: providers, error } = await supabase
        .from('ai_service_providers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('priority', { ascending: true });

      if (error) {
        console.error('Error fetching AI providers:', error);
        return [];
      }

      this.providersCache = (providers || []).map(p => ({
        id: p.id,
        provider: p.provider,
        api_key: p.api_key,
        preferred_model: p.preferred_model,
        priority: p.priority,
        status: p.status as 'active' | 'inactive' | 'error',
        last_verified: p.last_verified,
        error_message: p.error_message
      }));
      this.lastCacheUpdate = now;
      
      return this.providersCache;
    } catch (error) {
      console.error('Error getting active providers:', error);
      return [];
    }
  }

  /**
   * Main generation function that handles fallback logic
   */
  async generate(request: AIGenerateRequest): Promise<AIGenerateResponse | null> {
    // Check if AI service is enabled
    const isEnabled = await this.isAIServiceEnabled();
    if (!isEnabled) {
      toast.error('AI service is disabled. Please configure API keys in Settings.');
      return null;
    }

    const providers = await this.getActiveProviders();
    if (providers.length === 0) {
      toast.error('No AI providers configured. Please add API keys in Settings.');
      return null;
    }

    // Try each provider in priority order
    for (const provider of providers) {
      try {
        console.log(`Attempting to use provider: ${provider.provider}`);
        const result = await this.callProvider(provider, request);
        
        if (result) {
          // Update last_verified timestamp on successful use
          await this.updateProviderStatus(provider.id, 'active');
          return result;
        }
      } catch (error: any) {
        console.error(`Provider ${provider.provider} failed:`, error);
        
        // Mark provider as error and continue to next
        await this.updateProviderStatus(provider.id, 'error', error.message);
        
        // Don't show toast for individual provider failures, we'll try the next one
        continue;
      }
    }

    // All providers failed
    toast.error('All AI providers failed. Please check your API keys in Settings.');
    return null;
  }

  /**
   * Call a specific provider
   */
  private async callProvider(provider: AIProvider, request: AIGenerateRequest): Promise<AIGenerateResponse | null> {
    const messages = [
      {
        role: 'system' as const,
        content: this.getSystemPrompt(request.use_case)
      },
      {
        role: 'user' as const,
        content: request.input
      }
    ];

    const model = request.model || provider.preferred_model || this.getDefaultModel(provider.provider);

    try {
      const { data, error } = await supabase.functions.invoke('ai-proxy', {
        body: {
          service: provider.provider,
          endpoint: 'chat',
          params: {
            messages,
            model,
            temperature: request.temperature || 0.7,
            maxTokens: request.max_tokens || 4000
          },
          apiKey: provider.api_key
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.choices || data.choices.length === 0) {
        throw new Error('Invalid response from AI provider');
      }

      return {
        content: data.choices[0].message.content,
        provider_used: provider.provider,
        model_used: model,
        usage: data.usage
      };
    } catch (error: any) {
      console.error(`Error calling ${provider.provider}:`, error);
      throw error;
    }
  }

  /**
   * Update provider status
   */
  private async updateProviderStatus(providerId: string, status: 'active' | 'inactive' | 'error', errorMessage?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        last_verified: new Date().toISOString()
      };

      if (status === 'error' && errorMessage) {
        updateData.error_message = errorMessage;
      } else if (status === 'active') {
        updateData.error_message = null;
      }

      await supabase
        .from('ai_service_providers')
        .update(updateData)
        .eq('id', providerId);

      // Invalidate cache
      this.lastCacheUpdate = 0;
    } catch (error) {
      console.error('Error updating provider status:', error);
    }
  }

  /**
   * Get system prompt based on use case
   */
  private getSystemPrompt(useCase: string): string {
    const prompts = {
      title_generation: 'You are an expert content strategist. Generate compelling, SEO-optimized titles that capture attention and drive engagement.',
      outline_generation: 'You are an expert content writer. Create detailed, well-structured outlines that guide comprehensive content creation.',
      content_generation: 'You are an expert content writer. Create high-quality, engaging, and informative content that provides value to readers.',
      repurpose: 'You are an expert content strategist. Transform existing content into new formats while maintaining the core message and value.',
      chat: 'You are a helpful AI assistant focused on content strategy and SEO. Provide clear, actionable advice.',
      strategy: 'You are an expert content strategist. Develop comprehensive content strategies that align with business goals and audience needs.'
    };

    return prompts[useCase as keyof typeof prompts] || prompts.chat;
  }

  /**
   * Get default model for provider
   */
  private getDefaultModel(provider: string): string {
    const defaultModels = {
      openai: 'gpt-4.1-2025-04-14',
      openrouter: 'openai/gpt-4.1-2025-04-14',
      anthropic: 'claude-opus-4-20250514',
      gemini: 'gemini-1.5-pro',
      mistral: 'mistral-large'
    };

    return defaultModels[provider as keyof typeof defaultModels] || 'gpt-4.1-2025-04-14';
  }

  /**
   * Validate an API key
   */
  async validateProvider(provider: string, apiKey: string, model?: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-ai-key', {
        body: {
          provider,
          api_key: apiKey,
          model: model || this.getDefaultModel(provider)
        }
      });

      if (error) {
        return { valid: false, error: error.message };
      }

      return { valid: data.valid, error: data.error };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Clear cache (useful when providers are updated)
   */
  clearCache(): void {
    this.providersCache = [];
    this.lastCacheUpdate = 0;
  }
}

export default AIServiceController.getInstance();