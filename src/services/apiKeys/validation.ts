
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
  if (cleanKey.startsWith('sk-') && !cleanKey.startsWith('sk-ant-') && !cleanKey.startsWith('sk-or-')) {
    console.log('✅ Detected OpenAI API key format (sk- prefix, not Anthropic or OpenRouter)');
    return 'openai';
  }
  
  // Anthropic keys - high priority (very specific pattern)
  if (cleanKey.startsWith('sk-ant-')) {
    console.log('✅ Detected Anthropic API key format (sk-ant- prefix)');
    return 'anthropic';
  }
  
  // OpenRouter keys - specific pattern
  if (cleanKey.startsWith('sk-or-')) {
    console.log('✅ Detected OpenRouter API key format (sk-or- prefix)');
    return 'openrouter';
  }
  
  // Gemini keys - specific length and pattern
  if (cleanKey.length === 39 && /^[A-Za-z0-9_-]+$/.test(cleanKey)) {
    console.log('✅ Detected Gemini API key format (39 chars, alphanumeric)');
    return 'gemini';
  }
  
  // Serpstack keys - 32 character hex (most specific, check before mistral)
  if (cleanKey.length === 32 && /^[a-f0-9]+$/i.test(cleanKey)) {
    console.log('✅ Detected Serpstack API key format (32-char hex)');
    return 'serpstack';
  }
  
  // Mistral keys - specific patterns (after serpstack to avoid conflicts)
  if (cleanKey.startsWith('mi-') || (cleanKey.length === 32 && /^[A-Za-z0-9]+$/.test(cleanKey))) {
    console.log('✅ Detected Mistral API key format');
    return 'mistral';
  }
  
  // LM Studio keys - must be URLs with localhost or IP addresses
  if ((cleanKey.startsWith('http://') || cleanKey.startsWith('https://')) && 
      (cleanKey.includes('localhost') || cleanKey.includes('127.0.0.1') || /\d+\.\d+\.\d+\.\d+/.test(cleanKey))) {
    console.log('✅ Detected LM Studio API key format (URL)');
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
 * Enhanced API key format validation - PERMISSIVE MODE
 * Now accepts keys that pass basic sanity checks, pattern matching is advisory only
 */
export function validateApiKeyFormat(provider: ApiProvider | string, apiKey: string, bypassValidation: boolean = false): boolean {
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

    // BYPASS MODE: Accept any key that passes basic sanity checks
    if (bypassValidation) {
      const basicValid = cleanKey.length >= 8 && !/\s/.test(cleanKey);
      console.log(`🔓 Bypass validation mode: ${basicValid ? 'PASSED' : 'FAILED'} (length: ${cleanKey.length}, no whitespace: ${!/\s/.test(cleanKey)})`);
      return basicValid;
    }
    
    console.log(`🔍 Validating ${provider} API key format:`, {
      keyLength: cleanKey.length,
      firstChars: cleanKey.substring(0, 10) + '...',
      pattern: cleanKey.replace(/[A-Za-z0-9]/g, 'X').substring(0, 20)
    });
    
    // Basic sanity check - if this fails, reject immediately
    const passesBasicCheck = cleanKey.length >= 8 && !/\s/.test(cleanKey);
    if (!passesBasicCheck) {
      console.warn('❌ Basic sanity check failed: key too short or contains whitespace');
      return false;
    }
    
    let matchesPattern = false;
    let validationDetails = '';
    
    // Normalize serpapi alias to serp
    const normalizedProvider = provider === 'serpapi' ? 'serp' : provider;
    
    switch (normalizedProvider.toLowerCase()) {
      case 'openai':
        // Accept sk- prefix OR any key longer than 20 chars (new API key formats)
        const isOpenAiStart = cleanKey.startsWith('sk-');
        const isNotAnthropic = !cleanKey.startsWith('sk-ant-');
        const isNotOpenRouter = !cleanKey.startsWith('sk-or-');
        const isOpenAiLength = cleanKey.length > 20;
        validationDetails = `starts with sk-: ${isOpenAiStart}, not Anthropic: ${isNotAnthropic}, not OpenRouter: ${isNotOpenRouter}, length > 20: ${isOpenAiLength}`;
        matchesPattern = (isOpenAiStart && isNotAnthropic && isNotOpenRouter && isOpenAiLength) || isOpenAiLength;
        break;
      
      case 'anthropic':
        // Accept sk-ant- prefix OR any key with sk- longer than 40 chars
        const isAnthropicStart = cleanKey.startsWith('sk-ant-');
        const isAnthropicLength = cleanKey.length > 20;
        validationDetails = `starts with sk-ant-: ${isAnthropicStart}, length > 20: ${isAnthropicLength}`;
        matchesPattern = isAnthropicStart || isAnthropicLength;
        break;
      
      case 'gemini':
        // Accept 39-char keys OR any alphanumeric key 30+ chars
        const isGeminiLength = cleanKey.length === 39;
        const isGeminiPattern = /^[A-Za-z0-9_-]+$/.test(cleanKey);
        const isLongAlphanumeric = cleanKey.length >= 30 && /^[A-Za-z0-9_-]+$/.test(cleanKey);
        validationDetails = `length === 39: ${isGeminiLength}, valid pattern: ${isGeminiPattern}, long alphanumeric: ${isLongAlphanumeric}`;
        matchesPattern = (isGeminiLength && isGeminiPattern) || isLongAlphanumeric;
        break;
      
      case 'mistral':
        // Accept mi- prefix OR any key 20+ chars
        const isMistralStart = cleanKey.startsWith('mi-');
        const isMistralLength = cleanKey.length >= 20;
        validationDetails = `starts with mi-: ${isMistralStart}, length >= 20: ${isMistralLength}`;
        matchesPattern = isMistralStart || isMistralLength;
        break;
      
      case 'serp':
        // Accept any alphanumeric key 16-256 chars
        const isSerpLength = cleanKey.length >= 16 && cleanKey.length <= 256;
        const isSerpPattern = /^[A-Za-z0-9_.-]+$/.test(cleanKey);
        validationDetails = `length 16-256: ${isSerpLength}, valid pattern: ${isSerpPattern}`;
        matchesPattern = isSerpLength && isSerpPattern;
        break;
      
      case 'serpstack':
        // Accept any alphanumeric/hex key 16+ chars
        const isSerpstackLength = cleanKey.length >= 16;
        const isSerpstackPattern = /^[A-Za-z0-9]+$/.test(cleanKey);
        validationDetails = `length >= 16: ${isSerpstackLength}, alphanumeric: ${isSerpstackPattern}`;
        matchesPattern = isSerpstackLength && isSerpstackPattern;
        break;
      
      case 'lmstudio':
        // Accept URLs or any string 8+ chars
        const isLmStudioUrl = cleanKey.startsWith('http://') || cleanKey.startsWith('https://');
        const isLmStudioLength = cleanKey.length >= 8;
        validationDetails = `is URL: ${isLmStudioUrl}, length >= 8: ${isLmStudioLength}`;
        matchesPattern = isLmStudioUrl || isLmStudioLength;
        break;
      
      case 'openrouter':
        // Accept sk-or- prefix OR any key with sk- longer than 20 chars
        const isOpenRouterStart = cleanKey.startsWith('sk-or-');
        const isOpenRouterLength = cleanKey.length > 20;
        validationDetails = `starts with sk-or-: ${isOpenRouterStart}, length > 20: ${isOpenRouterLength}`;
        matchesPattern = isOpenRouterStart || isOpenRouterLength;
        break;
      
      default:
        // Unknown provider - accept any key that passes basic checks
        console.warn(`⚠️ Unknown provider for validation: ${provider}, accepting based on basic checks`);
        matchesPattern = true;
    }
    
    // PERMISSIVE: If pattern doesn't match, log warning but still accept
    if (!matchesPattern) {
      console.warn(`⚠️ ${provider} API key format doesn't match expected pattern, but accepting anyway. Details: ${validationDetails}`);
    } else {
      console.log(`✅ ${provider} API key format validation passed:`, validationDetails);
    }
    
    // Always return true if basic checks pass - pattern mismatch is just a warning
    return true;
  } catch (error: any) {
    console.error('❌ Error during API key validation:', error);
    // Even on error, be permissive
    return true;
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
  // Normalize serpapi alias
  const normalizedProvider = provider === 'serpapi' ? 'serp' : provider;
  
  switch (normalizedProvider) {
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
    
    case 'openrouter':
      if (!cleanKey.startsWith('sk-or-')) {
        return 'OpenRouter API keys must start with "sk-or-" (example: sk-or-abc123...)';
      }
      if (cleanKey.length <= 20) {
        return 'OpenRouter API keys must be longer than 20 characters';
      }
      break;
    
    case 'lmstudio':
      if (!cleanKey.startsWith('http://') && !cleanKey.startsWith('https://')) {
        return 'LM Studio endpoint must be a URL (example: http://localhost:1234)';
      }
      if (cleanKey.length < 8) {
        return 'LM Studio endpoint URL is too short';
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
  const providers: ApiProvider[] = ['openai', 'anthropic', 'gemini', 'mistral', 'serp', 'serpstack', 'lmstudio', 'openrouter'];
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
