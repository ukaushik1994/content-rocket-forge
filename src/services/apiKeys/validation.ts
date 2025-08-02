
import { ApiProvider } from '../apiKeyService';

/**
 * Detect API key type based on format with enhanced validation
 */
export function detectApiKeyType(apiKey: string): ApiProvider | null {
  if (!apiKey || typeof apiKey !== 'string') {
    console.warn('⚠️ Invalid API key provided for detection');
    return null;
  }
  
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    console.warn('⚠️ Empty API key provided for detection');
    return null;
  }
  
  console.log('🔍 Detecting API key type for key length:', cleanKey.length);
  
  // OpenAI keys start with 'sk-'
  if (cleanKey.startsWith('sk-') && !cleanKey.startsWith('sk-ant-')) {
    console.log('✅ Detected OpenAI API key format');
    return 'openai';
  }
  
  // Anthropic keys start with 'sk-ant-'
  if (cleanKey.startsWith('sk-ant-')) {
    console.log('✅ Detected Anthropic API key format');
    return 'anthropic';
  }
  
  // Gemini keys are typically 39 characters and alphanumeric
  if (cleanKey.length === 39 && /^[A-Za-z0-9_-]+$/.test(cleanKey)) {
    console.log('✅ Detected Gemini API key format');
    return 'gemini';
  }
  
  // Mistral keys typically start with certain patterns
  if (cleanKey.startsWith('mi-') || (cleanKey.length === 32 && /^[A-Za-z0-9]+$/.test(cleanKey))) {
    console.log('✅ Detected Mistral API key format');
    return 'mistral';
  }
  
  // SerpAPI keys - Updated to be more permissive for real SERP API keys
  if (cleanKey.length >= 16 && /^[A-Za-z0-9_.-]+$/.test(cleanKey)) {
    console.log('✅ Detected SERP API key format');
    return 'serp';
  }
  
  // Serpstack keys are typically 32 characters and hex
  if (cleanKey.length === 32 && /^[a-f0-9]+$/i.test(cleanKey)) {
    console.log('✅ Detected Serpstack API key format');
    return 'serpstack';
  }
  
  // LM Studio keys - these are typically custom/local, so we'll use a generic pattern
  if (cleanKey.startsWith('lms-') || cleanKey.includes('localhost') || cleanKey.includes('127.0.0.1')) {
    console.log('✅ Detected LM Studio API key format');
    return 'lmstudio';
  }
  
  console.log('❓ Could not detect API key type for provided key');
  return null;
}

/**
 * Validate API key format for a specific provider with enhanced validation
 */
export function validateApiKeyFormat(provider: ApiProvider | string, apiKey: string): boolean {
  try {
    if (!provider || typeof provider !== 'string') {
      console.warn('⚠️ Invalid provider specified for validation:', provider);
      return false;
    }
    
    if (!apiKey || typeof apiKey !== 'string') {
      console.warn('⚠️ Invalid API key provided for validation');
      return false;
    }
    
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      console.warn('⚠️ Empty API key provided for validation');
      return false;
    }
    
    console.log(`🔍 Validating ${provider} API key format, length: ${cleanKey.length}`);
    
    let isValid = false;
    
    switch (provider.toLowerCase()) {
      case 'openai':
        isValid = cleanKey.startsWith('sk-') && !cleanKey.startsWith('sk-ant-') && cleanKey.length > 20;
        break;
      
      case 'anthropic':
        isValid = cleanKey.startsWith('sk-ant-') && cleanKey.length > 20;
        break;
      
      case 'gemini':
        isValid = cleanKey.length === 39 && /^[A-Za-z0-9_-]+$/.test(cleanKey);
        break;
      
      case 'mistral':
        isValid = (cleanKey.startsWith('mi-') || /^[A-Za-z0-9]{32}$/.test(cleanKey)) && cleanKey.length >= 20;
        break;
      
      case 'serp':
        // Updated SERP API validation to be more permissive - allow alphanumeric, underscores, hyphens, and dots
        isValid = cleanKey.length >= 16 && /^[A-Za-z0-9_.-]+$/.test(cleanKey);
        break;
      
      case 'serpstack':
        isValid = cleanKey.length >= 16 && /^[a-f0-9]+$/i.test(cleanKey);
        break;
      
      case 'lmstudio':
        // LM Studio keys are more flexible as they're typically local/custom
        isValid = cleanKey.length >= 8;
        break;
      
      default:
        console.warn(`⚠️ Unknown provider for validation: ${provider}`);
        return false;
    }
    
    if (isValid) {
      console.log(`✅ ${provider} API key format validation passed`);
    } else {
      console.warn(`❌ ${provider} API key format validation failed`);
    }
    
    return isValid;
  } catch (error: any) {
    console.error('❌ Error during API key validation:', error);
    return false;
  }
}

/**
 * Get detailed validation error message for a specific provider
 */
export function getValidationErrorMessage(provider: ApiProvider, apiKey: string): string {
  if (!apiKey || !apiKey.trim()) {
    return 'API key cannot be empty';
  }
  
  const cleanKey = apiKey.trim();
  
  switch (provider) {
    case 'openai':
      if (!cleanKey.startsWith('sk-')) {
        return 'OpenAI API keys must start with "sk-"';
      }
      if (cleanKey.startsWith('sk-ant-')) {
        return 'This appears to be an Anthropic API key, not OpenAI';
      }
      if (cleanKey.length <= 20) {
        return 'OpenAI API keys must be longer than 20 characters';
      }
      break;
    
    case 'anthropic':
      if (!cleanKey.startsWith('sk-ant-')) {
        return 'Anthropic API keys must start with "sk-ant-"';
      }
      if (cleanKey.length <= 20) {
        return 'Anthropic API keys must be longer than 20 characters';
      }
      break;
    
    case 'gemini':
      if (cleanKey.length !== 39) {
        return 'Gemini API keys must be exactly 39 characters long';
      }
      if (!/^[A-Za-z0-9_-]+$/.test(cleanKey)) {
        return 'Gemini API keys can only contain letters, numbers, underscores, and hyphens';
      }
      break;
    
    case 'serp':
      if (cleanKey.length < 16) {
        return 'SERP API keys must be at least 16 characters long';
      }
      if (!/^[A-Za-z0-9_.-]+$/.test(cleanKey)) {
        return 'SERP API keys can contain letters, numbers, underscores, hyphens, and dots';
      }
      break;
    
    default:
      return `Invalid ${provider} API key format`;
  }
  
  return 'Invalid API key format';
}
