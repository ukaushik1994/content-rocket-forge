
import { ApiProvider } from '../apiKeyService';

/**
 * Detect API key type based on format
 */
export function detectApiKeyType(apiKey: string): ApiProvider | null {
  if (!apiKey) return null;
  
  // OpenAI keys start with 'sk-'
  if (apiKey.startsWith('sk-')) {
    return 'openai';
  }
  
  // Anthropic keys start with 'sk-ant-'
  if (apiKey.startsWith('sk-ant-')) {
    return 'anthropic';
  }
  
  // Gemini keys are typically 39 characters and alphanumeric
  if (apiKey.length === 39 && /^[A-Za-z0-9_-]+$/.test(apiKey)) {
    return 'gemini';
  }
  
  // Mistral keys typically start with certain patterns
  if (apiKey.startsWith('mi-') || (apiKey.length === 32 && /^[A-Za-z0-9]+$/.test(apiKey))) {
    return 'mistral';
  }
  
  // SerpAPI keys are typically 64 characters and hex
  if (apiKey.length === 64 && /^[a-f0-9]+$/.test(apiKey)) {
    return 'serp';
  }
  
  // Serpstack keys are typically 32 characters and hex
  if (apiKey.length === 32 && /^[a-f0-9]+$/.test(apiKey)) {
    return 'serpstack';
  }
  
  // LM Studio keys - these are typically custom/local, so we'll use a generic pattern
  if (apiKey.startsWith('lms-') || apiKey.includes('localhost') || apiKey.includes('127.0.0.1')) {
    return 'lmstudio';
  }
  
  return null;
}

/**
 * Validate API key format for a specific provider
 */
export function validateApiKeyFormat(provider: ApiProvider | string, apiKey: string): boolean {
  if (!apiKey) return false;
  
  switch (provider) {
    case 'openai':
      return apiKey.startsWith('sk-') && apiKey.length > 20;
    
    case 'anthropic':
      return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
    
    case 'gemini':
      return apiKey.length === 39 && /^[A-Za-z0-9_-]+$/.test(apiKey);
    
    case 'mistral':
      return (apiKey.startsWith('mi-') || /^[A-Za-z0-9]{32}$/.test(apiKey)) && apiKey.length >= 20;
    
    case 'serp':
      return apiKey.length === 64 && /^[a-f0-9]+$/.test(apiKey);
    
    case 'serpstack':
      return apiKey.length === 32 && /^[a-f0-9]+$/.test(apiKey);
    
    case 'lmstudio':
      // LM Studio keys are more flexible as they're typically local/custom
      return apiKey.length >= 8;
    
    default:
      return false;
  }
}
