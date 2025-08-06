
// CRUD operations for API keys using the main apiKeyService functions
import { getApiKey, saveApiKey, deleteApiKey, ApiProvider } from '../apiKeyService';
import AIServiceController from '../aiService/AIServiceController';
import { searchKeywords } from '../serpApiService';
import { AiProvider } from '../aiService/types';
import { supabase } from '@/integrations/supabase/client';

// Re-export the main functions for consistency
export { getApiKey, saveApiKey, deleteApiKey };
export type { ApiProvider };

export type ApiKeyStatus = 'not-configured' | 'configured' | 'verified';

export interface ApiKeyStatusResult {
  status: ApiKeyStatus;
  lastTested?: Date;
  error?: string;
}

// Cache for test results (5 minutes)
const TEST_CACHE_DURATION = 5 * 60 * 1000;
const testCache = new Map<string, { result: boolean; timestamp: number; error?: string }>();

/**
 * Check if an OpenRouter API key exists in user_llm_keys table
 */
async function hasOpenRouterKey(): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return false;

    const { data, error: keyError } = await supabase
      .from('user_llm_keys')
      .select('api_key')
      .eq('user_id', user.id)
      .eq('provider', 'openrouter')
      .eq('is_active', true)
      .single();

    return !keyError && !!data?.api_key;
  } catch (error) {
    return false;
  }
}

/**
 * Check if an API key exists for a provider
 */
export async function hasApiKey(provider: ApiProvider): Promise<boolean> {
  // OpenRouter uses user_llm_keys table
  if (provider === 'openrouter') {
    return hasOpenRouterKey();
  }
  
  // All other providers use api_keys table
  const key = await getApiKey(provider);
  return !!key;
}

/**
 * Test if an API key actually works
 */
async function testApiKeyFunctionality(provider: ApiProvider, skipFallback: boolean = false): Promise<{ success: boolean; error?: string }> {
  const cacheKey = `test_${provider}`;
  const cached = testCache.get(cacheKey);
  
  // Return cached result if still valid
  if (cached && Date.now() - cached.timestamp < TEST_CACHE_DURATION) {
    return { success: cached.result, error: cached.error };
  }

  try {
    // Check if the key exists using the appropriate method
    const hasKey = await hasApiKey(provider);
    if (!hasKey) {
      return { success: false, error: 'No API key configured' };
    }

    let testResult = false;
    let error: string | undefined;

    // Test AI providers
    if (['openai', 'anthropic', 'gemini', 'mistral', 'lmstudio', 'openrouter'].includes(provider)) {
      try {
        const response = await AIServiceController.generate({
          input: 'Test',
          use_case: 'chat',
          temperature: 0.1,
          max_tokens: 10
        });
        testResult = !!response?.content;
        if (!testResult) error = 'No response from AI provider';
      } catch (e: any) {
        error = e.message || 'AI provider test failed';
      }
    }
    // Test SERP providers
    else if (['serp', 'serpstack'].includes(provider)) {
      try {
        const response = await searchKeywords({
          query: 'test',
          limit: 1,
          provider: provider as 'serp' | 'serpstack'
        });
        testResult = !!response && Array.isArray(response);
        if (!testResult) error = 'No search results returned';
      } catch (e: any) {
        error = e.message || 'SERP provider test failed';
      }
    }
    // For other providers, just check if key exists (fallback)
    else {
      testResult = true;
    }

    // Cache the result
    testCache.set(cacheKey, { 
      result: testResult, 
      timestamp: Date.now(),
      error: testResult ? undefined : error
    });

    return { success: testResult, error };
  } catch (e: any) {
    const error = e.message || 'Unknown error testing API key';
    testCache.set(cacheKey, { 
      result: false, 
      timestamp: Date.now(),
      error 
    });
    return { success: false, error };
  }
}

/**
 * Get basic status of all API keys (existence only, no testing)
 */
export async function getAllApiKeysStatus(): Promise<Record<string, ApiKeyStatusResult>> {
  const providers: ApiProvider[] = ['serp', 'serpstack', 'openrouter', 'anthropic', 'openai', 'gemini', 'mistral', 'lmstudio'];
  const status: Record<string, ApiKeyStatusResult> = {};

  for (const provider of providers) {
    const hasKey = await hasApiKey(provider);
    
    if (!hasKey) {
      status[provider] = { status: 'not-configured' };
    } else {
      status[provider] = { status: 'configured' };
    }
  }

  return status;
}

/**
 * Test all configured API keys and return detailed status
 */
export async function testAllApiKeys(): Promise<Record<string, ApiKeyStatusResult>> {
  const providers: ApiProvider[] = ['serp', 'serpstack', 'openrouter', 'anthropic', 'openai', 'gemini', 'mistral', 'lmstudio'];
  const status: Record<string, ApiKeyStatusResult> = {};

  for (const provider of providers) {
    const hasKey = await hasApiKey(provider);
    
    if (!hasKey) {
      status[provider] = { status: 'not-configured' };
    } else {
      const testResult = await testApiKeyFunctionality(provider, true);
      status[provider] = {
        status: testResult.success ? 'verified' : 'configured',
        lastTested: new Date(),
        error: testResult.error
      };
    }
  }

  return status;
}

/**
 * Get simple boolean status (for backward compatibility)
 */
export async function getAllApiKeysStatusSimple(): Promise<Record<string, boolean>> {
  const providers: ApiProvider[] = ['serp', 'serpstack', 'openrouter', 'anthropic', 'openai', 'gemini', 'mistral', 'lmstudio'];
  const status: Record<string, boolean> = {};

  for (const provider of providers) {
    status[provider] = await hasApiKey(provider);
  }

  return status;
}
