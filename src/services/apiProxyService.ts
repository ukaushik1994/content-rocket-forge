
import { supabase } from '@/integrations/supabase/client';
import { getApiKey } from './apiKeyService';
import { toast } from 'sonner';

export type SerpProvider = 'serp' | 'serpstack';

interface ApiProxyParams {
  service: string;
  endpoint: string;
  params?: any;
}

/**
 * Call the unified API proxy service with any provider
 */
export async function callApiProxy(provider: SerpProvider, endpoint: string, params?: any) {
  try {
    console.log(`🚀 Calling API Proxy: ${provider} - ${endpoint}`);
    
    const apiKey = await getApiKey(provider);
    
    if (!apiKey) {
      throw new Error(`No ${provider.toUpperCase()} API key found. Please configure it in Settings.`);
    }

    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: {
        service: provider,
        endpoint,
        apiKey,
        params
      }
    });
    
    if (error) {
      console.error(`❌ API Proxy error for ${provider}:`, error);
      throw new Error(`${provider.toUpperCase()} API error: ${error.message || JSON.stringify(error)}`);
    }
    
    if (!data) {
      console.warn(`⚠️ No data returned from ${provider}`);
      return null;
    }
    
    if (!data.success && data.error) {
      throw new Error(data.error);
    }
    
    console.log(`✅ ${provider.toUpperCase()} API call successful`);
    return data;
  } catch (error) {
    console.error(`💥 Error calling ${provider} API:`, error);
    throw error;
  }
}

/**
 * Test API connection for a specific provider
 */
export async function testApiConnection(provider: SerpProvider) {
  try {
    const result = await callApiProxy(provider, 'test');
    
    if (result && result.success) {
      toast.success(`${result.provider} connection successful!`);
      return true;
    } else {
      toast.error(`${provider.toUpperCase()} connection failed`);
      return false;
    }
  } catch (error: any) {
    console.error(`${provider.toUpperCase()} test failed:`, error);
    toast.error(`${provider.toUpperCase()} test failed: ${error.message}`);
    return false;
  }
}

/**
 * Analyze keyword with specific provider
 */
export async function analyzeKeywordWithProvider(provider: SerpProvider, keyword: string) {
  try {
    console.log(`🎯 Analyzing keyword "${keyword}" with ${provider.toUpperCase()}`);
    
    const result = await callApiProxy(provider, 'analyze', { keyword });
    
    if (result) {
      toast.success(`${provider.toUpperCase()} analysis completed for "${keyword}"`);
      return result;
    } else {
      throw new Error(`No data returned from ${provider.toUpperCase()}`);
    }
  } catch (error: any) {
    console.error(`${provider.toUpperCase()} analysis failed:`, error);
    toast.error(`${provider.toUpperCase()} analysis failed: ${error.message}`);
    throw error;
  }
}

/**
 * Search with specific provider
 */
export async function searchWithProvider(provider: SerpProvider, query: string, limit = 10) {
  try {
    console.log(`🔍 Searching "${query}" with ${provider.toUpperCase()}`);
    
    const result = await callApiProxy(provider, 'search', { 
      q: query, 
      keyword: query,
      limit 
    });
    
    if (result) {
      return result;
    } else {
      throw new Error(`No search results from ${provider.toUpperCase()}`);
    }
  } catch (error: any) {
    console.error(`${provider.toUpperCase()} search failed:`, error);
    toast.error(`${provider.toUpperCase()} search failed: ${error.message}`);
    throw error;
  }
}
