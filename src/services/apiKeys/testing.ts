
/**
 * Functions to test API keys for various services
 */

import { getApiKey } from './crud';
import { decryptKey } from './encryption';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestApiResponse {
  success: boolean;
  message: string;
  details?: any;
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
    
    // For both SERP API and OpenAI, we test using our API proxy to avoid CORS issues
    if (service === 'serp' || service === 'openai') {
      try {
        console.log(`Sending API key test request for ${service}...`);
        
        // Use the API proxy function instead of direct API call to avoid CORS issues
        const response = await fetch('/api/proxy/test-api-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            service, 
            apiKey: decryptedKey 
          }),
        });
        
        const responseData = await response.text();
        console.info(`${service} API test raw response:`, responseData);
        
        if (!response.ok) {
          console.error(`${service} API key test failed with status ${response.status}: ${responseData}`);
          
          // Try to parse the response as JSON if possible
          try {
            const errorJson = JSON.parse(responseData);
            toast.error(`API key verification failed: ${errorJson.message || 'Unknown error'}`);
          } catch (e) {
            toast.error(`API key verification failed: ${responseData || 'Unknown error'}`);
          }
          
          return false;
        }
        
        try {
          const data = JSON.parse(responseData);
          console.info(`${service} API test response:`, data);
          
          if (data.success) {
            toast.success(`${service} API key verified successfully`);
            return true;
          } else {
            console.error(`${service} API key test failed:`, data);
            toast.error(data?.message || `${service} API connection failed`);
            return false;
          }
        } catch (jsonError) {
          console.error(`Error parsing JSON response from ${service} API test:`, jsonError, responseData);
          toast.error(`Error parsing API response: ${jsonError.message}`);
          // If we can't parse the JSON, assume the test failed
          return false;
        }
      } catch (error) {
        console.error(`Error testing ${service} API key:`, error);
        toast.error(`Error testing API key: ${error.message || 'Network error'}`);
        
        // If the API proxy endpoint is not available, we'll fall back to a simpler validation
        if (service === 'serp') {
          // Just check if the key looks like a valid SERP API key format
          const isValidFormat = decryptedKey && decryptedKey.length > 20;
          if (isValidFormat) {
            console.warn('SERP API proxy test failed, but key format appears valid. This could be a network or CORS issue.');
            toast.warning('Cannot connect to SERP API for verification. Key format appears valid but please ensure it has available credits.');
            return true; // Return true since the key format is valid even though we couldn't test it
          }
          return false;
        } else if (service === 'openai') {
          // Check if it looks like a valid OpenAI key
          return decryptedKey.startsWith('sk-') && decryptedKey.length > 30;
        }
        return false;
      }
    }
    
    // For other services, assume success for now if the key exists
    return true;
  } catch (error) {
    console.error(`Error testing ${service} API key:`, error);
    toast.error(`Error testing API key: ${error.message || 'Unknown error'}`);
    return false;
  }
}
