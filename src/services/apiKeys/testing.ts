
/**
 * Functions to test API keys for various services
 */

import { getApiKey } from './crud';
import { supabase } from '@/integrations/supabase/client';

interface TestApiResponse {
  success: boolean;
  message: string;
}

/**
 * Test if an API key is valid
 * @param service The service to test
 * @param apiKey Optional API key to test (if not provided, will get from database)
 * @returns A promise that resolves to a boolean indicating success
 */
export async function testApiKey(service: string, apiKey?: string): Promise<boolean> {
  try {
    const keyToTest = apiKey || await getApiKey(service);
    
    if (!keyToTest) {
      console.warn(`No API key found for ${service}`);
      return false;
    }
    
    // For SERP API, we test by making a direct API call to verify the key works
    if (service === 'serp') {
      const url = `https://serpapi.com/account?api_key=${keyToTest}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`SERP API key test failed with status ${response.status}`);
      }
      
      // If we get a successful response, the key is valid
      const data = await response.json();
      console.info('serp API test successful:', {
        success: true,
        message: 'SERP API connection successful'
      });
      return true;
    }
    
    // For OpenAI, we make a call to their test endpoint
    if (service === 'openai') {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${keyToTest}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('OpenAI API key test failed');
        }
        
        return true;
      } catch (error) {
        console.error('Error testing OpenAI API key:', error);
        return false;
      }
    }
    
    // For other services, assume success for now
    return true;
  } catch (error) {
    console.error(`Error testing ${service} API key:`, error);
    return false;
  }
}
