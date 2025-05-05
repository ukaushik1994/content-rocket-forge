
// Testing API keys

import { toast } from "sonner";

/**
 * Test an API key for a particular service
 * @param service The service to test the API key for
 * @param key The API key to test
 * @returns A promise that resolves to a boolean indicating success
 */
export async function testApiKey(service: string, key: string): Promise<boolean> {
  try {
    if (service === 'serp') {
      // For SERP API, we'll make a test call to SerpAPI
      try {
        // Create a simple test URL for a minimal search query
        const testUrl = new URL('https://serpapi.com/search');
        testUrl.searchParams.append('q', 'test');
        testUrl.searchParams.append('engine', 'google');
        testUrl.searchParams.append('api_key', key);
        
        // Make the request
        const response = await fetch(testUrl.toString());
        const data = await response.json();
        
        // Check if the response is OK (200-299)
        if (response.ok) {
          console.log('SERP API test successful:', data);
          toast.success(`${service} API connection successful`);
          return true;
        } else {
          console.error('SERP API test failed:', data);
          throw new Error(data.error || 'Invalid API key');
        }
      } catch (error: any) {
        console.error('Error testing SERP API key:', error);
        throw new Error(`Invalid SERP API key: ${error.message}`);
      }
    } else if (service === 'openai') {
      // For OpenAI, we'll validate the key format and make a simple test call
      if (!key.startsWith('sk-')) {
        throw new Error('Invalid OpenAI API key format - must start with "sk-"');
      }
      
      try {
        // Make a simple test request to verify the API key
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('OpenAI API test successful');
          toast.success(`${service} API connection successful`);
          return true;
        } else {
          console.error('OpenAI API test failed:', data);
          throw new Error(data.error?.message || 'Invalid API key');
        }
      } catch (error: any) {
        console.error('Error testing OpenAI API key:', error);
        throw new Error(`Invalid OpenAI API key: ${error.message}`);
      }
    } else if (service === 'anthropic' && key.startsWith('sk-ant-')) {
      toast.success(`${service} API key format looks valid`);
      return true;
    } else if (service === 'gemini' && key.length > 15) {
      toast.success(`${service} API key format looks valid`);
      return true;
    } else {
      throw new Error(`Invalid ${service} API key format`);
    }
  } catch (error: any) {
    toast.error(error.message || `${service} API connection failed`);
    return false;
  }
}

/**
 * Detect the type of API key based on its format
 * @param key The API key to detect
 * @returns A promise that resolves to the service name or null
 */
export async function detectApiKeyType(key: string): Promise<string | null> {
  // Detect API key type based on common formats
  if (key.startsWith('sk-') && !key.startsWith('sk-ant-')) {
    return 'openai';
  } else if (key.startsWith('sk-ant-')) {
    return 'anthropic';
  } else if (key.startsWith('AIza')) {
    return 'gemini';
  } else if (key.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(key)) {
    // Generic format check for SERP API keys
    return 'serp';
  }
  
  return null;
}
