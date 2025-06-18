
import { supabase } from '@/integrations/supabase/client';

/**
 * Test Serpstack API key using the secure api-proxy edge function
 */
export const testSerpstackApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    console.log('🧪 Testing Serpstack API key via api-proxy');
    
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify({
        service: 'serpstack',
        endpoint: 'test',
        apiKey: apiKey
      }),
    });

    if (error) {
      console.error('❌ Serpstack API test failed:', error);
      return false;
    }

    if (data?.success) {
      console.log('✅ Serpstack API test successful');
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('💥 Serpstack API test exception:', error);
    return false;
  }
};

/**
 * Test SerpAPI key using the secure api-proxy edge function
 */
export const testSerpApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    console.log('🧪 Testing SerpAPI key via api-proxy');
    
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify({
        service: 'serp',
        endpoint: 'test',
        apiKey: apiKey
      }),
    });

    if (error) {
      console.error('❌ SerpAPI test failed:', error);
      return false;
    }

    if (data?.success) {
      console.log('✅ SerpAPI test successful');
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('💥 SerpAPI test exception:', error);
    return false;
  }
};

/**
 * Test OpenAI API key
 */
export const testOpenAIApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    console.log('🧪 Testing OpenAI API key');
    
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify({
        service: 'openai',
        endpoint: 'test',
        apiKey: apiKey
      }),
    });

    if (error) {
      console.error('❌ OpenAI API test failed:', error);
      return false;
    }

    if (data?.success) {
      console.log('✅ OpenAI API test successful');
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('💥 OpenAI API test exception:', error);
    return false;
  }
};

/**
 * Test Anthropic API key
 */
export const testAnthropicApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    console.log('🧪 Testing Anthropic API key');
    
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify({
        service: 'anthropic',
        endpoint: 'test',
        apiKey: apiKey
      }),
    });

    if (error) {
      console.error('❌ Anthropic API test failed:', error);
      return false;
    }

    if (data?.success) {
      console.log('✅ Anthropic API test successful');
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('💥 Anthropic API test exception:', error);
    return false;
  }
};

/**
 * Test Gemini API key
 */
export const testGeminiApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    console.log('🧪 Testing Gemini API key');
    
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify({
        service: 'gemini',
        endpoint: 'test',
        apiKey: apiKey
      }),
    });

    if (error) {
      console.error('❌ Gemini API test failed:', error);
      return false;
    }

    if (data?.success) {
      console.log('✅ Gemini API test successful');
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('💥 Gemini API test exception:', error);
    return false;
  }
};

/**
 * Enhanced API key testing that supports multiple SERP providers
 */
export const testApiKey = async (serviceKey: string, apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  
  try {
    switch (serviceKey) {
      case 'serp':
        return await testSerpApiKey(apiKey);
      
      case 'serpstack':
        return await testSerpstackApiKey(apiKey);
      
      case 'openai':
        return await testOpenAIApiKey(apiKey);
      
      case 'anthropic':
        return await testAnthropicApiKey(apiKey);
      
      case 'gemini':
        return await testGeminiApiKey(apiKey);
      
      default:
        console.warn(`No test available for service: ${serviceKey}`);
        return true; // Assume valid if no test is available
    }
  } catch (error) {
    console.error(`Error testing ${serviceKey} API key:`, error);
    return false;
  }
};
