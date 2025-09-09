
import { ApiProvider } from '../apiKeyService';
import { supabase } from '@/integrations/supabase/client';
import { validateApiKeyFormat } from './validation';

/**
 * Test an API key by making a simple validation request
 * @param provider The API provider to test
 * @param apiKey The API key to test
 * @returns Promise<boolean> indicating if the key works
 */
export async function testApiKey(provider: ApiProvider, apiKey: string): Promise<boolean> {
  try {
    console.log(`🧪 Testing ${provider} API key...`);
    
    // Input validation
    if (!provider || typeof provider !== 'string') {
      console.error('❌ Invalid provider specified for testing:', provider);
      return false;
    }
    
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      console.error('❌ Invalid API key provided for testing');
      return false;
    }
    
    const cleanKey = apiKey.trim();
    
    // First, validate the format
    console.log(`🔍 Validating ${provider} API key format before testing...`);
    if (!validateApiKeyFormat(provider, cleanKey)) {
      console.warn(`⚠️ ${provider} API key format validation failed`);
      return false;
    }
    console.log(`✅ ${provider} API key format validation passed`);

    // Try to use the appropriate proxy function for real testing
    try {
      console.log(`🌐 Attempting real API test for ${provider} via edge function...`);
      
      // Route AI providers to ai-proxy, others to api-proxy
      const aiProviders = ['openai', 'anthropic', 'gemini', 'mistral', 'lmstudio'];
      const proxyFunction = aiProviders.includes(provider) ? 'ai-proxy' : 'api-proxy';
      
      const { data, error } = await supabase.functions.invoke(proxyFunction, {
        body: {
          service: provider,
          endpoint: 'test',
          apiKey: cleanKey
        }
      });

      if (error) {
        console.warn(`⚠️ API proxy not available for ${provider}, falling back to format validation:`, error);
        // Fall back to format validation
        return true; // Format was already validated above
      }

      const success = data?.success === true;
      if (success) {
        console.log(`✅ ${provider} API key real test passed`);
      } else {
        console.warn(`⚠️ ${provider} API key real test failed:`, data);
      }
      return success;
    } catch (proxyError: any) {
      console.warn(`⚠️ API proxy test failed for ${provider}, using format validation:`, proxyError);
      // Fall back to format validation - if we got here, format was valid
      return true;
    }
  } catch (error: any) {
    console.error(`❌ Error testing ${provider} API key:`, {
      message: error.message,
      name: error.name,
      provider,
      apiKeyLength: apiKey?.length || 0
    });
    return false;
  }
}

/**
 * Enhanced API key testing with actual API calls (when available)
 * @param provider The API provider to test
 * @param apiKey The API key to test
 * @returns Promise<boolean> indicating if the key works
 */
export async function testApiKeyWithCall(provider: ApiProvider, apiKey: string): Promise<boolean> {
  try {
    console.log(`🌐 Enhanced testing for ${provider} API key...`);
    
    // Input validation
    if (!provider || !apiKey?.trim()) {
      return false;
    }

    // Try to use the appropriate proxy function
    const aiProviders = ['openai', 'anthropic', 'gemini', 'mistral', 'lmstudio'];
    const proxyFunction = aiProviders.includes(provider) ? 'ai-proxy' : 'api-proxy';
    
    const { data, error } = await supabase.functions.invoke(proxyFunction, {
      body: {
        service: provider,
        endpoint: 'test',
        apiKey: apiKey.trim()
      }
    });

    if (error) {
      console.warn(`⚠️ API proxy not available for ${provider}, falling back to basic validation:`, error);
      return testApiKey(provider, apiKey);
    }

    const success = data?.success === true;
    console.log(`${success ? '✅' : '❌'} Enhanced ${provider} API test ${success ? 'passed' : 'failed'}`);
    return success;
  } catch (error: any) {
    console.warn(`⚠️ Enhanced API test failed for ${provider}, falling back to basic validation:`, error);
    return testApiKey(provider, apiKey);
  }
}

/**
 * Test multiple API keys in parallel
 * @param tests Array of {provider, apiKey} objects to test
 * @returns Promise<Record<string, boolean>> mapping provider to test result
 */
export async function testMultipleApiKeys(tests: Array<{provider: ApiProvider, apiKey: string}>): Promise<Record<string, boolean>> {
  console.log(`🧪 Testing ${tests.length} API keys in parallel...`);
  
  const results: Record<string, boolean> = {};
  
  try {
    const testPromises = tests.map(async ({ provider, apiKey }) => {
      try {
        const result = await testApiKey(provider, apiKey);
        results[provider] = result;
        return { provider, result };
      } catch (error) {
        console.error(`❌ Error testing ${provider}:`, error);
        results[provider] = false;
        return { provider, result: false };
      }
    });

    await Promise.all(testPromises);
    
    const successCount = Object.values(results).filter(Boolean).length;
    console.log(`✅ Parallel API testing completed: ${successCount}/${tests.length} successful`);
    
    return results;
  } catch (error: any) {
    console.error('❌ Error in parallel API testing:', error);
    // Return partial results
    return results;
  }
}
