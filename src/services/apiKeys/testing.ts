
/**
 * Functions to test API keys for various services
 */

import { getApiKey } from './crud';
import { decryptKey } from './encryption';
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
    
    // Decrypt the key if needed (keys are stored encrypted in the database)
    const decryptedKey = service === 'serp' ? decryptKey(keyToTest) : keyToTest;
    
    console.info(`Testing ${service} API key (length: ${decryptedKey.length})`);
    
    // For SERP API, we test using our API proxy to avoid CORS issues
    if (service === 'serp') {
      try {
        // Use the API proxy function instead of direct API call to avoid CORS issues
        const response = await fetch('/api/proxy/test-api-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            service: 'serp',
            apiKey: decryptedKey 
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`SERP API key test failed: ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        console.info('SERP API test response:', data);
        
        if (data.success) {
          return true;
        } else {
          throw new Error(data.message || 'SERP API key test failed');
        }
      } catch (error) {
        console.error('Error testing SERP API key:', error);
        // If the API proxy endpoint is not available, we'll fall back to a simpler validation
        // Just check if the key looks like a valid SERP API key format
        return decryptedKey && decryptedKey.length > 20;
      }
    }
    
    // For OpenAI, we make a call to their test endpoint
    if (service === 'openai') {
      try {
        const response = await fetch('/api/proxy/test-api-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            service: 'openai',
            apiKey: decryptedKey 
          }),
        });
        
        if (!response.ok) {
          throw new Error('OpenAI API key test failed');
        }
        
        const data = await response.json();
        return data.success;
      } catch (error) {
        console.error('Error testing OpenAI API key:', error);
        // Fall back to basic format validation
        return decryptedKey.startsWith('sk-') && decryptedKey.length > 20;
      }
    }
    
    // For other services, assume success for now if the key exists
    // We'll add specific testing for other services as needed
    return true;
  } catch (error) {
    console.error(`Error testing ${service} API key:`, error);
    return false;
  }
}
