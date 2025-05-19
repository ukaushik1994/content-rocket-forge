
/**
 * API key testing utilities
 */

import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { AdapterFactory } from '@/services/serp/adapters/AdapterFactory';
import { getApiKey } from './storage';

/**
 * Test an API key for validity
 * 
 * @param serviceKey - The service key identifier
 * @param apiKey - The API key to test
 * @returns Promise<boolean> - Whether the key is valid
 */
export const testApiKey = async (serviceKey: string, apiKey: string): Promise<boolean> => {
  try {
    // For SERP providers, use the adapter test method
    if (serviceKey === 'serpapi' || serviceKey === 'dataforseo') {
      const provider = serviceKey as SerpProvider;
      const adapter = AdapterFactory.getAdapter(provider);
      return await adapter.testApiKey(apiKey);
    }
    
    // For other API keys, just validate the format
    // This is a basic check - in a real app you would do more robust validation
    if (!apiKey || apiKey.trim() === '') {
      return false;
    }
    
    // At minimum, check that it looks like an API key (not empty, reasonable length)
    return apiKey.length > 8;
  } catch (error) {
    console.error(`Error testing API key for ${serviceKey}:`, error);
    return false;
  }
};

/**
 * Utility for encoding DataForSEO credentials
 */
export const encodeDataForSeoCredentials = (email: string, password: string): string => {
  return Buffer.from(`${email}:${password}`).toString('base64');
};

/**
 * Utility for decoding DataForSEO credentials
 */
export const decodeDataForSeoCredentials = (encoded: string): { email: string, password: string } => {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString();
    const [email, password] = decoded.split(':');
    return { email, password };
  } catch (error) {
    console.error('Error decoding DataForSEO credentials:', error);
    return { email: '', password: '' };
  }
};

/**
 * Check if a string appears to be DataForSEO format
 */
export const isDataForSeoFormat = (value: string): boolean => {
  try {
    const { email, password } = decodeDataForSeoCredentials(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && password.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Attempts to detect the type of API key
 */
export const detectApiKeyType = async (apiKey: string): Promise<string | null> => {
  // Check OpenAI key format (usually starts with "sk-")
  if (apiKey.startsWith('sk-') && apiKey.length > 30) {
    return 'openai';
  }

  // Check Anthropic key format
  if ((apiKey.startsWith('sk-ant-') || apiKey.startsWith('sk-claude-')) && apiKey.length > 30) {
    return 'anthropic';
  }
  
  // Check DataForSEO format
  if (isDataForSeoFormat(apiKey)) {
    return 'dataforseo';
  }
  
  // If none of the above, we can't determine the type
  return null;
};
