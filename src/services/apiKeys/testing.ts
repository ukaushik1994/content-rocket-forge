
/**
 * API key testing utilities
 */

import { SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { isDataForSeoFormat } from '../serp/adapters/dataforseo/ApiKeyTester';

/**
 * Test an API key for a specific service
 * 
 * @param service - The service identifier
 * @param apiKey - The API key to test
 * @returns Promise<boolean> - Whether the key is valid
 */
export const testApiKey = async (service: string, apiKey: string): Promise<boolean> => {
  try {
    // Basic validation - check that the API key isn't empty
    if (!apiKey || apiKey.trim() === '') {
      return false;
    }
    
    // Service-specific testing logic
    switch (service) {
      case 'openai':
        return await testOpenAIKey(apiKey);
      case 'anthropic':
        return await testAnthropicKey(apiKey);
      case 'serpapi':
        return await testSerpApiKey(apiKey);
      case 'dataforseo':
        return await testDataForSeoKey(apiKey);
      // Add more services as needed
      default:
        // For services without specific tests, return true if key exists
        return true;
    }
  } catch (error) {
    console.error(`Error testing ${service} API key:`, error);
    return false;
  }
};

// Test OpenAI API key
const testOpenAIKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Simulate a test - in production this would call the OpenAI API
    return apiKey.startsWith('sk-') && apiKey.length > 20;
  } catch (error) {
    console.error('Error testing OpenAI API key:', error);
    return false;
  }
};

// Test Anthropic API key
const testAnthropicKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Simulate a test - in production this would call the Anthropic API
    return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
  } catch (error) {
    console.error('Error testing Anthropic API key:', error);
    return false;
  }
};

// Test SERP API key
const testSerpApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Simulate a test - in production this would call the SERP API
    return apiKey.length > 10;
  } catch (error) {
    console.error('Error testing SERP API key:', error);
    return false;
  }
};

// Test DataForSEO key
const testDataForSeoKey = async (apiKey: string): Promise<boolean> => {
  try {
    // For DataForSEO, the apiKey is actually a base64 encoded username:password
    return isDataForSeoFormat(apiKey);
  } catch (error) {
    console.error('Error testing DataForSEO key:', error);
    return false;
  }
};
