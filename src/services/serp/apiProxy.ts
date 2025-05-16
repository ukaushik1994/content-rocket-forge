
import { toast } from 'sonner';
import { getApiKey } from '../apiKeyService';
import { decryptKey } from '../apiKeys/encryption';

/**
 * Helper function to create a proxy URL for SERP API calls to avoid CORS issues
 */
export const createProxyUrl = (endpoint: string, params: Record<string, string>) => {
  const queryString = new URLSearchParams(params).toString();
  return `/api/proxy/serp?endpoint=${encodeURIComponent(endpoint)}&${queryString}`;
};

/**
 * Get the SERP API key and handle common errors
 */
export const getSerpApiKey = async (): Promise<string | null> => {
  try {
    // Get the encrypted API key
    const apiKey = await getApiKey('serp');
    if (!apiKey) {
      console.warn('No SERP API key found in settings');
      toast.error('Missing SERP API key. Please add your API key in Settings → API.');
      return null;
    }
    
    // Decrypt the key
    const decryptedKey = decryptKey(apiKey);
    if (!decryptedKey) {
      console.error('Failed to decrypt SERP API key');
      toast.error('Error with API key. Please try re-adding your API key in Settings.');
      return null;
    }
    
    return decryptedKey;
  } catch (error) {
    console.error('Error retrieving SERP API key:', error);
    toast.error('Failed to access SERP API key');
    return null;
  }
};

/**
 * Execute SERP API call with fallback to proxy for CORS issues
 */
export const callSerpApi = async (
  endpoint: string, 
  params: Record<string, string>,
  apiKey: string
): Promise<any> => {
  try {
    // Add API key to params
    const searchParams = new URLSearchParams({
      ...params,
      api_key: apiKey
    });

    const url = `https://serpapi.com/${endpoint}?${searchParams.toString()}`;
    
    try {
      // First try direct API call
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (fetchError) {
      console.warn('Direct fetch to SERP API failed, likely due to CORS. Trying proxy...', fetchError);
      
      // If direct fetch fails due to CORS, use our local proxy instead
      const proxyUrl = createProxyUrl(endpoint, params);
      const proxyResponse = await fetch(proxyUrl);
      
      if (!proxyResponse.ok) {
        throw new Error(`Proxy API request failed with status ${proxyResponse.status}`);
      }
      
      return await proxyResponse.json();
    }
  } catch (error) {
    console.error('All attempts to call SERP API failed:', error);
    throw error;
  }
};
