
import { ApiProvider } from '../apiKeyService';

/**
 * Enhanced API key type detection with better ordering and specificity
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
  
  console.log('🔍 Detecting API key type for key:', {
    length: cleanKey.length,
    firstChars: cleanKey.substring(0, 10) + '...',
    pattern: cleanKey.replace(/[A-Za-z0-9]/g, 'X').substring(0, 20)
  });
  
  // OpenAI keys - highest priority (specific pattern)
  if (cleanKey.startsWith('sk-') && !cleanKey.startsWith('sk-ant-')) {
    console.log('✅ Detected OpenAI API key format (sk- prefix, not Anthropic)');
    return 'openai';
  }
  
  // Anthropic keys - high priority (very specific pattern)
  if (cleanKey.startsWith('sk-ant-')) {
    console.log('✅ Detected Anthropic API key format (sk-ant- prefix)');
    return 'anthropic';
  }
  
  // Gemini keys - specific length and pattern
  if (cleanKey.length === 39 && /^[A-Za-z0-9_-]+$/.test(cleanKey)) {
    console.log('✅ Detected Gemini API key format (39 chars, alphanumeric)');
    return 'gemini';
  }
  
  // Mistral keys - specific patterns
  if (cleanKey.startsWith('mi-') || (cleanKey.length === 32 && /^[A-Za-z0-9]+$/.test(cleanKey))) {
    console.log('✅ Detected Mistral API key format');
    return 'mistral';
  }
  
  // Serpstack keys - 32 character hex (more specific than SERP)
  if (cleanKey.length === 32 && /^[a-f0-9]+$/i.test(cleanKey)) {
    console.log('✅ Detected Serpstack API key format (32-char hex)');
    return 'serpstack';
  }
  
  // LM Studio keys - local/custom patterns
  if (cleanKey.startsWith('lms-') || cleanKey.includes('localhost') || cleanKey.includes('127.0.0.1')) {
    console.log('✅ Detected LM Studio API key format');
    return 'lmstudio';
  }
  
  // SERP API keys - moved to end to prevent conflicts, made more specific
  if (cleanKey.length >= 16 && cleanKey.length <= 128 && 
      /^[A-Za-z0-9_.-]+$/.test(cleanKey) && 
      !cleanKey.startsWith('sk-') && 
      !cleanKey.startsWith('mi-') && 
      !cleanKey.startsWith('lms-') &&
      cleanKey.length !== 32 && // Not serpstack
      cleanKey.length !== 39) { // Not gemini
    console.log('✅ Detected SERP API key format (process of elimination)');
    return 'serp';
  }
  
  console.log('❓ Could not detect API key type for provided key:', {
    length: cleanKey.length,
    startsWithSk: cleanKey.startsWith('sk-'),
    startsWithMi: cleanKey.startsWith('mi-'),
    hasSpecialChars: /[^A-Za-z0-9_.-]/.test(cleanKey),
    patternMatch: cleanKey.replace(/[A-Za-z0-9]/g, 'X').substring(0, 20)
  });
  return null;
}

/**
 * Enhanced API key format validation with detailed logging
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
    
    console.log(`🔍 Validating ${provider} API key format:`, {
      keyLength: cleanKey.length,
      firstChars: cleanKey.substring(0, 10) + '...',
      pattern: cleanKey.replace(/[A-Za-z0-9]/g, 'X').substring(0, 20)
    });
    
    let isValid = false;
    let validationDetails = '';
    
    switch (provider.toLowerCase()) {
      case 'openai':
        const isOpenAiStart = cleanKey.startsWith('sk-');
        const isNotAnthropic = !cleanKey.startsWith('sk-ant-');
        const isOpenAiLength = cleanKey.length > 20;
        validationDetails = `starts with sk-: ${isOpenAiStart}, not Anthropic: ${isNotAnthropic}, length > 20: ${isOpenAiLength}`;
        isValid = isOpenAiStart && isNotAnthropic && isOpenAiLength;
        break;
      
      case 'anthropic':
        const isAnthropicStart = cleanKey.startsWith('sk-ant-');
        const isAnthropicLength = cleanKey.length > 20;
        validationDetails = `starts with sk-ant-: ${isAnthropicStart}, length > 20: ${isAnthropicLength}`;
        isValid = isAnthropicStart && isAnthropicLength;
        break;
      
      case 'gemini':
        const isGeminiLength = cleanKey.length === 39;
        const isGeminiPattern = /^[A-Za-z0-9_-]+$/.test(cleanKey);
        validationDetails = `length === 39: ${isGeminiLength}, valid pattern: ${isGeminiPattern}`;
        isValid = isGeminiLength && isGeminiPattern;
        break;
      
      case 'mistral':
        const isMistralStart = cleanKey.startsWith('mi-');
        const isMistral32 = /^[A-Za-z0-9]{32}$/.test(cleanKey);
        const isMistralLength = cleanKey.length >= 20;
        validationDetails = `starts with mi-: ${isMistralStart}, 32-char pattern: ${isMistral32}, length >= 20: ${isMistralLength}`;
        isValid = (isMistralStart || isMistral32) && isMistralLength;
        break;
      
      case 'serp':
        const isSerpLength = cleanKey.length >= 16 && cleanKey.length <= 128;
        const isSerpPattern = /^[A-Za-z0-9_.-]+$/.test(cleanKey);
        const isNotOtherProvider = !cleanKey.startsWith('sk-') && !cleanKey.startsWith('mi-') && !cleanKey.startsWith('lms-');
        const isNotSpecificLength = cleanKey.length !== 32 && cleanKey.length !== 39;
        validationDetails = `length 16-128: ${isSerpLength}, valid pattern: ${isSerpPattern}, not other provider: ${isNotOtherProvider}, not specific length: ${isNotSpecificLength}`;
        isValid = isSerpLength && isSerpPattern && isNotOtherProvider && isNotSpecificLength;
        break;
      
      case 'serpstack':
        const isSerpstackLength = cleanKey.length >= 16;
        const isSerpstackHex = /^[a-f0-9]+$/i.test(cleanKey);
        validationDetails = `length >= 16: ${isSerpstackLength}, hex pattern: ${isSerpstackHex}`;
        isValid = isSerpstackLength && isSerpstackHex;
        break;
      
      case 'lmstudio':
        const isLmStudioLength = cleanKey.length >= 8;
        validationDetails = `length >= 8: ${isLmStudioLength}`;
        isValid = isLmStudioLength;
        break;
      
      default:
        console.warn(`⚠️ Unknown provider for validation: ${provider}`);
        return false;
    }
    
    console.log(`${isValid ? '✅' : '❌'} ${provider} API key format validation:`, validationDetails);
    
    if (!isValid) {
      console.warn(`❌ ${provider} API key format validation failed. Details: ${validationDetails}`);
    }
    
    return isValid;
  } catch (error: any) {
    console.error('❌ Error during API key validation:', error);
    return false;
  }
}

/**
 * Enhanced validation error messages with specific guidance
 */
export function getValidationErrorMessage(provider: ApiProvider, apiKey: string): string {
  if (!apiKey || !apiKey.trim()) {
    return 'API key cannot be empty';
  }
  
  const cleanKey = apiKey.trim();
  
  switch (provider) {
    case 'openai':
      if (!cleanKey.startsWith('sk-')) {
        return 'OpenAI API keys must start with "sk-" (example: sk-abc123...)';
      }
      if (cleanKey.startsWith('sk-ant-')) {
        return 'This appears to be an Anthropic API key, not OpenAI. Please select the correct provider.';
      }
      if (cleanKey.length <= 20) {
        return 'OpenAI API keys must be longer than 20 characters';
      }
      break;
    
    case 'anthropic':
      if (!cleanKey.startsWith('sk-ant-')) {
        return 'Anthropic API keys must start with "sk-ant-" (example: sk-ant-abc123...)';
      }
      if (cleanKey.length <= 20) {
        return 'Anthropic API keys must be longer than 20 characters';
      }
      break;
    
    case 'gemini':
      if (cleanKey.length !== 39) {
        return 'Gemini API keys must be exactly 39 characters long (example: AIzaSy...)';
      }
      if (!/^[A-Za-z0-9_-]+$/.test(cleanKey)) {
        return 'Gemini API keys can only contain letters, numbers, underscores, and hyphens';
      }
      break;
    
    case 'serp':
      if (cleanKey.length < 16) {
        return 'SERP API keys must be at least 16 characters long';
      }
      if (cleanKey.length > 128) {
        return 'SERP API keys should not exceed 128 characters';
      }
      if (!/^[A-Za-z0-9_.-]+$/.test(cleanKey)) {
        return 'SERP API keys can contain letters, numbers, underscores, hyphens, and dots (example: abc123_def.456)';
      }
      if (cleanKey.startsWith('sk-')) {
        return 'This appears to be an OpenAI API key. Please select the correct provider.';
      }
      if (cleanKey.startsWith('mi-')) {
        return 'This appears to be a Mistral API key. Please select the correct provider.';
      }
      break;
    
    default:
      return `Invalid ${provider} API key format. Please check the key and try again.`;
  }
  
  return `Invalid ${provider} API key format. Please verify the key is correct.`;
}

/**
 * Debug function to test API key against all providers
 */
export function debugApiKeyFormat(apiKey: string): Record<string, { matches: boolean; details: string }> {
  const providers: ApiProvider[] = ['openai', 'anthropic', 'gemini', 'mistral', 'serp', 'serpstack', 'lmstudio'];
  const results: Record<string, { matches: boolean; details: string }> = {};
  
  console.log('🐛 Debug: Testing API key against all providers');
  
  providers.forEach(provider => {
    const matches = validateApiKeyFormat(provider, apiKey);
    const details = getValidationErrorMessage(provider, apiKey);
    results[provider] = { matches, details };
    console.log(`🐛 Debug: ${provider} - ${matches ? 'MATCH' : 'NO MATCH'} - ${details}`);
  });
  
  return results;
}
