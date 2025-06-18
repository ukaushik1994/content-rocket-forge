import { supabase } from '@/integrations/supabase/client';

import { testOpenAIApiKey } from './openai';
import { testAnthropicApiKey } from './anthropic';
import { testGeminiApiKey } from './gemini';

/**
 * Test Serpstack API key
 */
export const testSerpstackApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    console.log('🧪 Testing Serpstack API key');
    
    // Make a minimal test request to Serpstack API
    const testUrl = 'https://api.serpstack.com/search';
    const params = new URLSearchParams({
      access_key: apiKey,
      query: 'test',
      type: 'web',
      num: '1'
    });
    
    const response = await fetch(`${testUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentBuilder/1.0)',
      }
    });
    
    console.log('📊 Serpstack API response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Serpstack API error response:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Serpstack API test successful');
    
    // Check if we got valid search results (Serpstack wraps results in success field)
    if (data.success && (data.organic_results || data.search_information)) {
      return true;
    } else if (data.error) {
      console.error('❌ Serpstack API error:', data.error);
      return false;
    }
    
    return false;
    
  } catch (error: any) {
    console.error('💥 Serpstack API connection test failed:', error);
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

/**
 * Test SerpAPI key (existing function)
 */
const testSerpApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    console.log('🧪 Testing SerpAPI key');
    
    // Make a minimal test request to SerpAPI
    const testUrl = 'https://serpapi.com/search';
    const params = new URLSearchParams({
      api_key: apiKey,
      engine: 'google',
      q: 'test',
      num: '1'
    });
    
    const response = await fetch(`${testUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentBuilder/1.0)',
      }
    });
    
    console.log('📊 SerpAPI response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ SerpAPI error response:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ SerpAPI test successful');
    
    // Check if we got valid search results
    if (data.organic_results || data.search_metadata) {
      return true;
    } else if (data.error) {
      console.error('❌ SerpAPI error:', data.error);
      return false;
    }
    
    return false;
    
  } catch (error: any) {
    console.error('💥 SerpAPI connection test failed:', error);
    return false;
  }
};
