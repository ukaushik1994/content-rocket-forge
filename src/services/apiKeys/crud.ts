
// CRUD operations for API keys using the main apiKeyService functions
import { getApiKey as getOriginalApiKey, saveApiKey, deleteApiKey, ApiProvider } from '../apiKeyService';
import AIServiceController from '../aiService/AIServiceController';
import { searchKeywords } from '../serpApiService';
import { AiProvider } from '../aiService/types';
import { supabase } from '@/integrations/supabase/client';

// Re-export the main functions for consistency, but override getApiKey with unified version
export { saveApiKey, deleteApiKey };
export { getUnifiedApiKey as getApiKey };
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
 * Unified API key retrieval that checks both tables
 */
async function getUnifiedApiKey(provider: ApiProvider): Promise<string | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // For OpenRouter, check user_llm_keys table first (new format)
    if (provider === 'openrouter') {
      const { data, error: keyError } = await supabase
        .from('user_llm_keys')
        .select('api_key')
        .eq('user_id', user.id)
        .eq('provider', 'openrouter')
        .eq('is_active', true)
        .single();

      if (!keyError && data?.api_key) {
        console.log(`✅ Found ${provider} key in user_llm_keys table`);
        return data.api_key;
      }
    }
    
    // Use the main service for all providers (it has fallback logic)
    const key = await getOriginalApiKey(provider);
    if (key) {
      console.log(`✅ Found ${provider} key via main service`);
      return key;
    }
    
    console.log(`❌ No ${provider} key found in any table`);
    return null;
  } catch (error) {
    console.error(`❌ Error getting ${provider} key:`, error);
    return null;
  }
}

/**
 * Check if an API key exists for a provider
 */
export async function hasApiKey(provider: ApiProvider): Promise<boolean> {
  const key = await getUnifiedApiKey(provider);
  return !!key && key.trim().length > 0;
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
