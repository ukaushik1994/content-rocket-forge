
import { ApiProvider } from '@/services/apiKeyService';
import { validateApiKeyFormat, detectApiKeyType, debugApiKeyFormat } from '@/services/apiKeys/validation';
import { testApiKey } from '@/services/apiKeys/testing';

/**
 * Comprehensive API key validation and debugging utility
 */
export interface ApiKeyDebugResult {
  key: {
    length: number;
    pattern: string;
    startsWithSk: boolean;
    startsWithSkAnt: boolean;
    startsWithMi: boolean;
    hasSpecialChars: boolean;
    isHex: boolean;
  };
  detection: {
    detectedType: ApiProvider | null;
    confidence: 'high' | 'medium' | 'low';
    alternativeTypes: ApiProvider[];
  };
  validation: {
    [K in ApiProvider]: {
      isValid: boolean;
      errorMessage: string;
    };
  };
  recommendations: string[];
}

/**
 * Analyze an API key comprehensively
 */
export function analyzeApiKey(apiKey: string): ApiKeyDebugResult {
  if (!apiKey || !apiKey.trim()) {
    return {
      key: {
        length: 0,
        pattern: '',
        startsWithSk: false,
        startsWithSkAnt: false,
        startsWithMi: false,
        hasSpecialChars: false,
        isHex: false
      },
      detection: {
        detectedType: null,
        confidence: 'low',
        alternativeTypes: []
      },
      validation: {} as any,
      recommendations: ['Please enter a valid API key']
    };
  }

  const cleanKey = apiKey.trim();
  
  // Analyze key properties
  const keyAnalysis = {
    length: cleanKey.length,
    pattern: cleanKey.replace(/[A-Za-z0-9]/g, 'X').substring(0, 20),
    startsWithSk: cleanKey.startsWith('sk-'),
    startsWithSkAnt: cleanKey.startsWith('sk-ant-'),
    startsWithMi: cleanKey.startsWith('mi-'),
    hasSpecialChars: /[^A-Za-z0-9_.-]/.test(cleanKey),
    isHex: /^[a-f0-9]+$/i.test(cleanKey)
  };

  // Detect type
  const detectedType = detectApiKeyType(cleanKey);
  
  // Test against all providers
  const providers: ApiProvider[] = ['openai', 'anthropic', 'gemini', 'mistral', 'serp', 'serpstack', 'lmstudio'];
  const validation: any = {};
  const alternativeTypes: ApiProvider[] = [];
  
  providers.forEach(provider => {
    const isValid = validateApiKeyFormat(provider, cleanKey);
    validation[provider] = {
      isValid,
      errorMessage: isValid ? 'Valid format' : getValidationError(provider, cleanKey)
    };
    
    if (isValid && provider !== detectedType) {
      alternativeTypes.push(provider);
    }
  });

  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (detectedType && validation[detectedType]?.isValid) {
    confidence = alternativeTypes.length === 0 ? 'high' : 'medium';
  }

  // Generate recommendations
  const recommendations = generateRecommendations(keyAnalysis, detectedType, validation);

  return {
    key: keyAnalysis,
    detection: {
      detectedType,
      confidence,
      alternativeTypes
    },
    validation,
    recommendations
  };
}

/**
 * Get validation error for a specific provider
 */
function getValidationError(provider: ApiProvider, apiKey: string): string {
  try {
    return require('@/services/apiKeys/validation').getValidationErrorMessage(provider, apiKey);
  } catch {
    return `Invalid ${provider} API key format`;
  }
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(
  keyAnalysis: any,
  detectedType: ApiProvider | null,
  validation: any
): string[] {
  const recommendations: string[] = [];

  if (!detectedType) {
    recommendations.push('Could not automatically detect API key type. Please select the correct provider manually.');
    
    if (keyAnalysis.startsWithSk) {
      if (keyAnalysis.startsWithSkAnt) {
        recommendations.push('Key starts with "sk-ant-" - this appears to be an Anthropic API key.');
      } else {
        recommendations.push('Key starts with "sk-" - this appears to be an OpenAI API key.');
      }
    } else if (keyAnalysis.startsWithMi) {
      recommendations.push('Key starts with "mi-" - this appears to be a Mistral API key.');
    } else if (keyAnalysis.length === 39) {
      recommendations.push('Key is 39 characters long - this might be a Gemini API key.');
    } else if (keyAnalysis.length === 32 && keyAnalysis.isHex) {
      recommendations.push('Key is 32-character hex - this might be a Serpstack API key.');
    }
  }

  if (keyAnalysis.hasSpecialChars) {
    recommendations.push('Key contains special characters that may not be supported by some providers.');
  }

  if (keyAnalysis.length < 16) {
    recommendations.push('Key appears too short for most API providers (minimum 16 characters).');
  }

  if (keyAnalysis.length > 128) {
    recommendations.push('Key appears unusually long (over 128 characters).');
  }

  // Find valid providers
  const validProviders = Object.entries(validation)
    .filter(([_, result]: [string, any]) => result.isValid)
    .map(([provider]) => provider);

  if (validProviders.length > 1) {
    recommendations.push(`Key format matches multiple providers: ${validProviders.join(', ')}. Please verify which service this key is from.`);
  } else if (validProviders.length === 1 && validProviders[0] !== detectedType) {
    recommendations.push(`Key format matches ${validProviders[0]} but was detected as ${detectedType}. Consider selecting ${validProviders[0]} manually.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('API key format looks good!');
  }

  return recommendations;
}

/**
 * Test API key with comprehensive error handling
 */
export async function testApiKeyWithDebug(
  provider: ApiProvider,
  apiKey: string
): Promise<{
  success: boolean;
  error?: string;
  debugInfo: ApiKeyDebugResult;
  testDetails: {
    formatValid: boolean;
    connectionTest: boolean;
    errorDetails?: string;
  };
}> {
  console.log(`🧪 Testing ${provider} API key with comprehensive debugging`);
  
  const debugInfo = analyzeApiKey(apiKey);
  
  const testDetails = {
    formatValid: debugInfo.validation[provider]?.isValid || false,
    connectionTest: false,
    errorDetails: undefined as string | undefined
  };

  // If format is invalid, don't proceed with connection test
  if (!testDetails.formatValid) {
    return {
      success: false,
      error: debugInfo.validation[provider]?.errorMessage || `Invalid ${provider} API key format`,
      debugInfo,
      testDetails
    };
  }

  // Test connection
  try {
    console.log(`🔌 Testing ${provider} API connection...`);
    const connectionSuccess = await testApiKey(provider, apiKey);
    testDetails.connectionTest = connectionSuccess;
    
    if (connectionSuccess) {
      console.log(`✅ ${provider} API key test successful`);
      return {
        success: true,
        debugInfo,
        testDetails
      };
    } else {
      console.log(`❌ ${provider} API key connection test failed`);
      return {
        success: false,
        error: `${provider} API key format is valid but connection test failed. Please verify the key is active and has proper permissions.`,
        debugInfo,
        testDetails
      };
    }
  } catch (error: any) {
    console.error(`💥 Error during ${provider} API connection test:`, error);
    testDetails.errorDetails = error.message;
    
    return {
      success: false,
      error: error.message || `Failed to test ${provider} API key connection`,
      debugInfo,
      testDetails
    };
  }
}

/**
 * Emergency bypass function for manual provider selection
 */
export function bypassValidation(provider: ApiProvider, apiKey: string): boolean {
  console.warn(`⚠️ BYPASSING validation for ${provider} API key - USE WITH CAUTION`);
  
  // Basic sanity checks only
  if (!apiKey || !apiKey.trim()) {
    return false;
  }
  
  const cleanKey = apiKey.trim();
  if (cleanKey.length < 8 || cleanKey.length > 200) {
    return false;
  }
  
  // Allow any reasonable key format
  return true;
}
