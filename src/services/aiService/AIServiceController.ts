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
  use_case: 'title_generation' | 'outline_generation' | 'content_generation' | 'repurpose' | 'chat' | 'strategy' | 'suggestion_generation';
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

  /**
   * Clear provider cache to force fresh data fetch
   */
  clearCache(): void {
    this.providersCache = [];
    this.lastCacheUpdate = 0;
    console.log('🗑️ AIServiceController cache cleared');
  }

  // Provider metadata registry
  private static readonly PROVIDER_METADATA: Record<string, Omit<ProviderInfo, 'id' | 'status' | 'is_configured' | 'last_verified'>> = {
    openrouter: {
      name: 'OpenRouter',
      description: 'Access multiple AI models through a single API gateway',
      icon_name: 'brain',
      category: 'AI Services',
      setup_url: 'https://openrouter.ai/keys',
      capabilities: ['chat', 'completion', 'multimodal'],
      available_models: ['gpt-5-2025-08-07', 'gpt-5-mini-2025-08-07', 'gpt-4.1-2025-04-14', 'claude-opus-4-20250514', 'claude-sonnet-4-20250514'],
      is_required: false
    },
    openai: {
      name: 'OpenAI',
      description: 'Advanced AI models for content generation and analysis',
      icon_name: 'brain',
      category: 'AI Services',
      setup_url: 'https://platform.openai.com/api-keys',
      capabilities: ['chat', 'completion', 'vision', 'embedding'],
      available_models: ['gpt-5-2025-08-07', 'gpt-5-mini-2025-08-07', 'gpt-5-nano-2025-08-07', 'gpt-4.1-2025-04-14', 'o3-2025-04-16', 'o4-mini-2025-04-16'],
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
   * PHASE 2 FIX: Query ai_service_providers directly for active providers
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

      console.log('🔍 Querying ai_service_providers for active providers...');
      
      // Query ai_service_providers directly for active providers with valid keys
      const { data: dbProviders, error } = await supabase
        .from('ai_service_providers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .not('api_key', 'is', null)
        .order('priority', { ascending: true });

      if (error) {
        console.error('❌ Error fetching active providers:', error);
        return [];
      }

      const validProviders: AIProvider[] = (dbProviders || [])
        .filter(p => p.api_key && p.api_key.trim())
        .map(p => ({
          id: p.id,
          provider: p.provider,
          api_key: p.api_key,
          preferred_model: p.preferred_model || '',
          priority: p.priority,
          status: p.status as 'active' | 'error' | 'inactive',
          description: p.description || '',
          setup_url: p.setup_url || '',
          icon_name: p.icon_name || 'zap',
          category: p.category || 'AI Services',
          capabilities: Array.isArray(p.capabilities) ? p.capabilities : [],
          available_models: Array.isArray(p.available_models) ? p.available_models : [],
          is_required: p.is_required || false,
          error_message: p.error_message || undefined,
          last_verified: p.last_verified || undefined
        }));

      this.providersCache = validProviders;
      this.lastCacheUpdate = now;
      
      console.log(`✅ Found ${validProviders.length} active providers from ai_service_providers`);
      console.log('🔍 Active providers:', validProviders.map(p => `${p.provider} (priority: ${p.priority})`));
      return this.providersCache;
    } catch (error) {
      console.error('❌ Error getting active providers:', error);
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
        (configuredProviders || []).map(p => [p.provider, {
          ...p,
          capabilities: Array.isArray(p.capabilities) 
            ? p.capabilities.filter((item): item is string => typeof item === 'string')
            : [],
          available_models: Array.isArray(p.available_models) 
            ? p.available_models.filter((item): item is string => typeof item === 'string')
            : []
        }])
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
   * Main generation function that handles fallback logic with SERP intelligence integration
   */
  async generate(
    useCaseOrRequest: string | AIGenerateRequest,
    systemPrompt?: string,
    userPrompt?: string,
    options?: { temperature?: number; maxTokens?: number; formatType?: string; userInstructions?: string; serpContext?: any }
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

    // Enhance with SERP predictive intelligence if available
    let enhancedSystemPrompt = systemPrompt;
    // Simplified enhancement for now - removed method call
    if (options?.serpContext && request.use_case.includes('strategy')) {
      enhancedSystemPrompt = systemPrompt + '\n\nConsider SERP intelligence and predictive insights in your recommendations.';
    }

    const errors: string[] = [];

    // Try each provider in order of priority
    for (const provider of providers) {
      try {
        console.log(`🎯 Attempting to use ${provider.provider} for ${request.use_case}`);
        
        const result = await this.callProvider(provider, request, enhancedSystemPrompt, options?.formatType, options?.userInstructions);
        
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
   * Call a specific provider using the unified enhanced-ai-chat function
   */
  private async callProvider(
    provider: AIProvider, 
    request: AIGenerateRequest, 
    customSystemPrompt?: string,
    formatType?: string,
    userInstructions?: string
  ): Promise<any> {
    try {
      const systemPrompt = customSystemPrompt || await this.getEnhancedSystemPrompt(
        request.use_case, 
        userInstructions, 
        formatType
      );
      
      // Get decrypted API keys from new unified service
      const { getApiKey } = await import('@/services/apiKeys/crud');
      const apiKeys: Record<string, string> = {};
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User authentication required');
      }
      
      // Try to get decrypted key for the specific provider
      try {
        const key = await getApiKey(provider.provider as any);
        if (key) {
          apiKeys[provider.provider] = key;
          console.log(`🔑 Using decrypted key for ${provider.provider}`);
        }
      } catch (error) {
        console.error(`Failed to get API key for ${provider.provider}:`, error);
        throw new Error(`No valid API key found for ${provider.provider}`);
      }
      
      if (Object.keys(apiKeys).length === 0) {
        throw new Error(`No API keys configured for ${provider.provider}`);
      }
      
      // Use enhanced-ai-chat edge function for consistency
      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: request.input }
          ],
          userId: user.id,
          apiKeys,
          context: {
            analytics: {},
            solutions: [],
            workflowContext: {}
          }
        }
      });

      if (error) {
        throw new Error(`Enhanced AI service error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No response from enhanced AI service');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Enhanced response parsing for enhanced-ai-chat format
      console.log('🔍 Raw response from enhanced-ai-chat:', JSON.stringify(data, null, 2));
      
      let content = '';
      
      // Enhanced-ai-chat returns the message directly
      if (data.message && typeof data.message === 'string') {
        content = data.message;
        console.log('✅ Extracted content from enhanced-ai-chat message field');
      } else {
        console.warn('❌ Unexpected response format from enhanced-ai-chat:', data);
        throw new Error('Invalid response format from AI service');
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
   * Get enhanced system prompt combining hardcoded base + template-based prompts + user instructions
   */
  private async getEnhancedSystemPrompt(
    useCase: string, 
    userInstructions?: string,
    formatType?: string
  ): Promise<string> {
    // Base hardcoded prompts - essential AI identity and behavior
    const basePrompts = {
      title_generation: "You are an expert content creator. Generate compelling, SEO-friendly titles that capture attention and accurately represent the content topic.",
      outline_generation: "You are an expert content strategist. Create detailed, well-structured outlines that provide a clear framework for comprehensive content creation.",
      content_generation: "You are an expert content writer. Create high-quality, engaging, and informative content that provides value to readers and follows SEO best practices.",
      repurpose: "You are an expert content repurposing specialist. Transform the given content into the requested format while maintaining key information and adapting the tone appropriately.",
      chat: "You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user queries.",
      strategy: "You are an expert content strategist. Analyze the given information and provide strategic recommendations for content creation and marketing.",
      suggestion_generation: `You are an expert content optimization specialist. Analyze the given content and provide specific, actionable text replacement suggestions to improve content quality based on the identified issue.

Return your response as a JSON array of suggestions. Each suggestion should have this exact structure:
{
  "id": "unique-suggestion-id",
  "title": "Brief title describing the improvement",
  "impact": "high" | "medium" | "low",
  "category": "clarity" | "seo" | "readability" | "engagement" | "structure",
  "replacements": [
    {
      "before": "exact text to replace from the content",
      "after": "improved replacement text",
      "reason": "explanation for this specific change",
      "location": {
        "startIndex": 0,
        "endIndex": 0
      }
    }
  ]
}

Focus on:
1. Finding exact text segments that can be improved
2. Providing clear, actionable replacements
3. Explaining why each change improves the content
4. Ensuring 'before' text exists exactly in the provided content

Return ONLY the JSON array, no other text.`
    };

    let enhancedPrompt = basePrompts[useCase as keyof typeof basePrompts] || basePrompts.chat;

    // Add template-based detailed instructions for content generation
    if (useCase === 'content_generation') {
      try {
        // Import template service to avoid circular dependencies
        const { getPromptTemplatesByType } = await import('@/services/userPreferencesService');
        
        // Try to get template for specific format type (e.g., 'blog', 'social-twitter')
        const templates = formatType ? getPromptTemplatesByType(formatType) : [];
        
        if (templates.length > 0) {
          // Use the first template for the format type
          const template = templates[0];
          console.log(`🎯 Using enhanced template prompt for ${formatType}: ${template.name}`);
          
          enhancedPrompt += `\n\nDETAILED CONTENT CREATION INSTRUCTIONS:\n${template.promptTemplate}`;
          
          if (template.structureTemplate) {
            enhancedPrompt += `\n\nSTRUCTURE TEMPLATE:\n${template.structureTemplate}`;
          }
        } else {
          // Fallback to default blog template if no specific format template exists
          const allTemplates = getPromptTemplatesByType('blog');
          if (allTemplates.length > 0) {
            const defaultTemplate = allTemplates[0];
            console.log(`🎯 Using fallback blog template: ${defaultTemplate.name}`);
            enhancedPrompt += `\n\nDETAILED CONTENT CREATION INSTRUCTIONS:\n${defaultTemplate.promptTemplate}`;
          }
        }
      } catch (error) {
        console.warn('Failed to load prompt templates, using base prompt:', error);
      }
    }

    // Add user-specific instructions if provided
    if (userInstructions && userInstructions.trim()) {
      enhancedPrompt += `\n\nUSER-SPECIFIC INSTRUCTIONS:\n${userInstructions.trim()}`;
      console.log('📝 Added user instructions to prompt');
    }

    return enhancedPrompt;
  }

  /**
   * Get system prompt for specific use case (legacy method for backward compatibility)
   */
  private getSystemPrompt(useCase: string): string {
    const prompts = {
      title_generation: "You are an expert content creator. Generate compelling, SEO-friendly titles that capture attention and accurately represent the content topic.",
      outline_generation: "You are an expert content strategist. Create detailed, well-structured outlines that provide a clear framework for comprehensive content creation.",
      content_generation: "You are an expert content writer. Create high-quality, engaging, and informative content that provides value to readers and follows SEO best practices.",
      repurpose: "You are an expert content repurposing specialist. Transform the given content into the requested format while maintaining key information and adapting the tone appropriately.",
      chat: "You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user queries.",
      strategy: "You are an expert content strategist. Analyze the given information and provide strategic recommendations for content creation and marketing.",
      suggestion_generation: `You are an expert content optimization specialist. Analyze the given content and provide specific, actionable text replacement suggestions to improve content quality based on the identified issue.

Return your response as a JSON array of suggestions. Each suggestion should have this exact structure:
{
  "id": "unique-suggestion-id",
  "title": "Brief title describing the improvement",
  "impact": "high" | "medium" | "low",
  "category": "clarity" | "seo" | "readability" | "engagement" | "structure",
  "replacements": [
    {
      "before": "exact text to replace from the content",
      "after": "improved replacement text",
      "reason": "explanation for this specific change",
      "location": {
        "startIndex": 0,
        "endIndex": 0
      }
    }
  ]
}

Focus on:
1. Finding exact text segments that can be improved
2. Providing clear, actionable replacements
3. Explaining why each change improves the content
4. Ensuring 'before' text exists exactly in the provided content

Return ONLY the JSON array, no other text.`
    };

    return prompts[useCase as keyof typeof prompts] || prompts.chat;
  }

  /**
   * Test provider connection - supports both configured and new providers
   */
  async testProvider(providerIdOrProvider: string, apiKey?: string): Promise<boolean> {
    try {
      // If API key is provided, test with that key (for configuration)
      if (apiKey) {
        const result = await this.validateProvider(providerIdOrProvider, apiKey);
        return result.valid;
      }

      // If no API key provided, test configured provider by ID
      const providers = await this.getAllProviders();
      const provider = providers.find(p => p.id === providerIdOrProvider);
      
      if (!provider) {
        toast.error(`Provider ${providerIdOrProvider} not found`);
        return false;
      }

      if (!provider.is_configured) {
        toast.error(`Provider ${provider.name} is not configured`);
        return false;
      }

      // Get the actual provider data with API key
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: providerData } = await supabase
        .from('ai_service_providers')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', providerIdOrProvider)
        .single();

      if (!providerData?.api_key) {
        toast.error(`No API key found for ${provider.name}`);
        return false;
      }

      console.log(`🧪 Testing ${provider.name} connection...`);
      toast.loading(`Testing ${provider.name} connection...`);

      // Try to get decrypted API key from new service, fallback to encrypted key from database
      const { getApiKey } = await import('@/services/apiKeys/crud');
      let apiKeyToUse = null;
      
      try {
        apiKeyToUse = await getApiKey(providerIdOrProvider as any);
        if (apiKeyToUse) {
          console.log(`🔑 Using decrypted key for testing ${provider.name}`);
        }
      } catch (error) {
        // Fallback to database encrypted key
        if (providerData.api_key && providerData.api_key.trim()) {
          apiKeyToUse = providerData.api_key;
          console.log(`🔑 Using legacy encrypted key for testing ${provider.name}`);
        }
      }
      
      if (!apiKeyToUse) {
        throw new Error(`No valid API key found for ${provider.name}`);
      }

      const { data, error } = await supabase.functions.invoke('ai-proxy', {
        body: {
          service: providerIdOrProvider,
          endpoint: 'test',
          apiKey: apiKeyToUse
        }
      });

      if (error) {
        console.error(`❌ ${provider.name} test failed:`, error);
        toast.error(`${provider.name} test failed: ${error.message}`);
        await this.updateProviderStatus(providerData.id, 'error', error.message);
        return false;
      }

      if (data?.success) {
        console.log(`✅ ${provider.name} test successful`);
        toast.success(data.message || `${provider.name} connection successful`);
        await this.updateProviderStatus(providerData.id, 'active');
        return true;
      } else {
        console.error(`❌ ${provider.name} test failed:`, data);
        toast.error(data?.error || `${provider.name} test failed`);
        await this.updateProviderStatus(providerData.id, 'error', data?.error);
        return false;
      }
    } catch (error: any) {
      console.error(`💥 Error testing provider:`, error);
      toast.error(error.message || 'Provider test failed');
      return false;
    }
  }

  /**
   * Add or update a provider - supports both object and individual parameters
   */
  async addProvider(providerDataOrProvider: string | {
    provider: string;
    api_key: string;
    preferred_model?: string;
    priority: number;
  }, apiKey?: string, preferredModel?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Handle both signatures
      let providerData: {
        provider: string;
        api_key: string;
        preferred_model?: string;
        priority: number;
      };

      if (typeof providerDataOrProvider === 'string') {
        // Individual parameters signature
        const providers = await this.getActiveProviders();
        providerData = {
          provider: providerDataOrProvider,
          api_key: apiKey!,
          preferred_model: preferredModel,
          priority: providers.length + 1
        };
      } else {
        // Object signature
        providerData = providerDataOrProvider;
      }

      const metadata = AIServiceController.PROVIDER_METADATA[providerData.provider];
      if (!metadata) {
        throw new Error(`Unknown provider: ${providerData.provider}`);
      }

      // Check if provider already exists
      const { data: existingProvider } = await supabase
        .from('ai_service_providers')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider', providerData.provider)
        .single();

      if (existingProvider) {
        // Update existing provider
        const { error } = await supabase
          .from('ai_service_providers')
          .update({
            api_key: providerData.api_key,
            preferred_model: providerData.preferred_model,
            status: 'active',
            error_message: null,
            last_verified: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProvider.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new provider
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

        if (error) throw error;
      }

      // Clear cache to force refresh
      this.clearCache();
    } catch (error) {
      console.error('Failed to add/update provider:', error);
      throw error;
    }
  }

  /**
   * Get default model for a provider
   */
  getDefaultModel(provider: string): string {
    const defaults = {
      openrouter: 'gpt-5-2025-08-07',
      openai: 'gpt-5-2025-08-07',
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
          service: provider,
          endpoint: 'test',
          apiKey
        }
      });

      if (error) {
        return { valid: false, error: error.message };
      }

      if (data && data.success) {
        return { valid: true };
      }

      return { valid: false, error: data?.error || 'Validation failed' };
    } catch (error: any) {
      return { valid: false, error: error.message };
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