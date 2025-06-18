
// API key validation utilities

import { testApiKey } from './testing';

/**
 * Validate API key format for different services
 */
export const validateApiKeyFormat = (service: string, key: string): boolean => {
  if (!key || key.trim() === '') {
    return false;
  }

  const cleanKey = key.trim();

  switch (service) {
    case 'serp':
      // SerpAPI keys are typically 64 character alphanumeric strings
      return /^[a-f0-9]{64}$/.test(cleanKey);
    
    case 'serpstack':
      // Serpstack keys are typically 32 character alphanumeric strings
      // Being more flexible to accept various formats
      return cleanKey.length >= 16 && /^[a-zA-Z0-9]+$/.test(cleanKey);
    
    case 'openai':
      // OpenAI keys start with sk- followed by alphanumeric characters
      return cleanKey.startsWith('sk-') && cleanKey.length > 20;
    
    case 'anthropic':
      // Anthropic keys start with sk-ant-
      return cleanKey.startsWith('sk-ant-') && cleanKey.length > 20;
    
    case 'gemini':
      // Gemini keys are typically 39-character alphanumeric strings
      return cleanKey.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(cleanKey);
    
    default:
      // For unknown services, accept any non-empty string
      return cleanKey.length > 0;
  }
};

/**
 * Enhanced API key type detection
 */
export const detectApiKeyType = async (key: string): Promise<string | null> => {
  if (!key || key.trim() === '') {
    return null;
  }

  const cleanKey = key.trim();

  // Check OpenAI format
  if (cleanKey.startsWith('sk-') && !cleanKey.startsWith('sk-ant-')) {
    return 'openai';
  }

  // Check Anthropic format
  if (cleanKey.startsWith('sk-ant-')) {
    return 'anthropic';
  }

  // Check SerpAPI format (64 char hex)
  if (/^[a-f0-9]{64}$/.test(cleanKey)) {
    return 'serp';
  }

  // Check Serpstack format (flexible alphanumeric)
  if (cleanKey.length >= 16 && cleanKey.length <= 64 && /^[a-zA-Z0-9]+$/.test(cleanKey)) {
    // Try to test it as Serpstack
    try {
      const isSerpstack = await testApiKey('serpstack', cleanKey);
      if (isSerpstack) {
        return 'serpstack';
      }
    } catch (error) {
      console.log('Failed to test as Serpstack:', error);
    }
  }

  // Check Gemini format
  if (cleanKey.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(cleanKey)) {
    return 'gemini';
  }

  return null;
};

/**
 * Get user-friendly error messages for API key validation
 */
export const getApiKeyValidationError = (service: string, key: string): string | null => {
  if (!key || key.trim() === '') {
    return `Please enter a valid ${service.toUpperCase()} API key`;
  }

  const cleanKey = key.trim();

  switch (service) {
    case 'serp':
      if (!validateApiKeyFormat(service, cleanKey)) {
        return 'SerpAPI keys should be 64-character hexadecimal strings';
      }
      break;
    
    case 'serpstack':
      if (!validateApiKeyFormat(service, cleanKey)) {
        return 'Serpstack API keys should be alphanumeric strings (16+ characters)';
      }
      break;
    
    case 'openai':
      if (!validateApiKeyFormat(service, cleanKey)) {
        return 'OpenAI API keys should start with "sk-" followed by additional characters';
      }
      break;
    
    case 'anthropic':
      if (!validateApiKeyFormat(service, cleanKey)) {
        return 'Anthropic API keys should start with "sk-ant-" followed by additional characters';
      }
      break;
    
    case 'gemini':
      if (!validateApiKeyFormat(service, cleanKey)) {
        return 'Gemini API keys should be alphanumeric strings (20+ characters)';
      }
      break;
  }

  return null;
};
