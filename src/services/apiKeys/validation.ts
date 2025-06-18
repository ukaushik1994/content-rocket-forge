
import { testApiKey } from './testing';

/**
 * Detect API key type based on patterns and format
 */
export const detectApiKeyType = async (apiKey: string): Promise<string | null> => {
  if (!apiKey) return null;
  
  // SerpAPI patterns
  if (apiKey.match(/^[a-f0-9]{64}$/)) {
    return 'serp';
  }
  
  // Serpstack patterns (typically access keys)
  if (apiKey.match(/^[a-f0-9]{32}$/) || apiKey.match(/^[A-Za-z0-9]{32}$/)) {
    return 'serpstack';
  }
  
  // OpenAI patterns
  if (apiKey.startsWith('sk-') && apiKey.length >= 40) {
    return 'openai';
  }
  
  // Anthropic patterns
  if (apiKey.startsWith('sk-ant-') && apiKey.length >= 40) {
    return 'anthropic';
  }
  
  // Google/Gemini patterns
  if (apiKey.startsWith('AIza') && apiKey.length >= 35) {
    return 'gemini';
  }
  
  // Stripe patterns
  if (apiKey.startsWith('sk_') || apiKey.startsWith('pk_')) {
    return 'stripe';
  }
  
  return null;
};

/**
 * Validate provider API key format
 */
export const validateProviderKeyFormat = (provider: string, key: string): boolean => {
  switch (provider) {
    case 'openai':
      return key.startsWith('sk-') && key.length >= 40;
    case 'anthropic':
      return key.startsWith('sk-ant-') && key.length >= 40;
    case 'gemini':
      return key.startsWith('AIzaSy') && key.length >= 35;
    case 'serp':
      return validateSerpApiKey(key);
    case 'serpstack':
      return validateSerpstackApiKey(key);
    case 'stripe':
      return key.startsWith('sk_') || key.startsWith('pk_');
    default:
      return key.length >= 16; // Basic validation for other providers
  }
};

/**
 * Validate Serpstack API key format
 */
export const validateSerpstackApiKey = (apiKey: string): boolean => {
  const serpstackPatterns = [
    /^[a-f0-9]{32}$/, // 32-character hex string
    /^[A-Za-z0-9]{32}$/, // 32-character alphanumeric
    /^[A-Za-z0-9_-]{32,}$/, // Base64-like string (32+ chars)
  ];
  
  return serpstackPatterns.some(pattern => pattern.test(apiKey));
};

/**
 * Enhanced SERP API key validation for both providers
 */
export const validateSerpApiKey = (apiKey: string): boolean => {
  // SerpAPI key patterns (more permissive to match real SerpAPI keys)
  const serpApiPatterns = [
    /^[a-f0-9]{64}$/, // 64-character hex string (most common)
    /^[a-f0-9]{32}$/, // 32-character hex string
    /^[A-Za-z0-9_-]{32,}$/, // Base64-like string (32+ chars)
    /^[A-Za-z0-9]{20,}$/, // 20+ character alphanumeric
    /^[A-Za-z0-9_.-]{16,}$/ // 16+ chars with common special characters
  ];
  
  return serpApiPatterns.some(pattern => pattern.test(apiKey));
};
