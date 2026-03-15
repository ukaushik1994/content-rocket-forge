
/**
 * Enhanced utility functions for testing API key functionality with comprehensive error handling
 */

import { supabase } from "@/integrations/supabase/client";

export interface ApiKeyTestResult {
  success: boolean;
  provider: string;
  keyLength: number;
  formatValid: boolean;
  connectionValid: boolean;
  error?: string;
  details?: {
    detectedProvider?: string;
    alternativeProviders?: string[];
    suggestions?: string[];
  };
}

export const testApiKeyDecryption = (encryptedKey: string): string | null => {
  try {
    console.log('🔓 Testing API key decryption...');
    
    // Enhanced base64 detection
    if (isValidBase64(encryptedKey)) {
      console.log('📝 API key appears to be base64 encoded, attempting decode...');
      const decrypted = atob(encryptedKey);
      console.log('🔓 API key decryption test successful');
      return decrypted;
    } else {
      console.log('📝 API key appears to be plain text');
      return encryptedKey;
    }
  } catch (error) {
    console.error('❌ API key decryption test failed:', error);
    return null;
  }
};

/**
 * Enhanced base64 validation
 */
function isValidBase64(str: string): boolean {
  try {
    // Check if string matches base64 pattern
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Pattern.test(str)) {
      return false;
    }
    
    // Try to decode and re-encode
    const decoded = atob(str);
    const reencoded = btoa(decoded);
    return reencoded === str;
  } catch {
    return false;
  }
}

export const validateSerpApiKey = (apiKey: string): boolean => {
  console.log('🔍 Validating SERP API key format...');
  
  if (!apiKey || typeof apiKey !== 'string') {
    console.warn('⚠️ Invalid API key provided for SERP validation');
    return false;
  }
  
  const cleanKey = apiKey.trim();
  
  // Enhanced SERP API key validation patterns
  const serpApiPatterns = [
    /^[a-f0-9]{64}$/, // 64-character hex string (most common)
    /^[a-f0-9]{32}$/, // 32-character hex string
    /^[A-Za-z0-9_-]{32,}$/, // Base64-like string (32+ chars)
    /^[A-Za-z0-9]{20,}$/, // 20+ character alphanumeric
    /^[A-Za-z0-9_.-]{16,128}$/ // 16-128 chars with common special characters
  ];
  
  const isValid = serpApiPatterns.some(pattern => pattern.test(cleanKey));
  
  console.log(`${isValid ? '✅' : '❌'} SERP API key format validation:`, {
    keyLength: cleanKey.length,
    pattern: cleanKey.replace(/[A-Za-z0-9]/g, 'X').substring(0, 20),
    isValid
  });
  
  return isValid;
};

export const testSerpApiConnection = async (apiKey: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🧪 Testing direct SerpAPI connection with enhanced error handling...');
    
    if (!apiKey || !apiKey.trim()) {
      return { success: false, error: 'API key is required' };
    }
    
    const cleanKey = apiKey.trim();
    
    // Validate format first
    if (!validateSerpApiKey(cleanKey)) {
      return { success: false, error: 'Invalid SERP API key format' };
    }
    
    console.log('🌐 Making test request to SerpAPI...');
    
    // Make a minimal test request to SerpAPI directly
    const testUrl = 'https://serpapi.com/search';
    const params = new URLSearchParams({
      api_key: cleanKey,
      engine: 'google',
      q: 'test',
      num: '1'
    });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(`${testUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ContentBuilder/1.0)',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📊 SerpAPI response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SerpAPI error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText.substring(0, 500)
        });
        
        // Parse error response
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            return { success: false, error: errorData.error };
          }
        } catch (parseError) {
          // If not JSON, use the raw text
          console.warn('⚠️ Could not parse error response as JSON');
        }
        
        // Provide specific error messages based on status
        if (response.status === 401) {
          return { success: false, error: 'Invalid API key. Please check your SerpAPI key.' };
        }
        
        if (response.status === 429) {
          return { success: false, error: 'API rate limit exceeded. Please try again later.' };
        }
        
        if (response.status === 403) {
          return { success: false, error: 'Access forbidden. Please check your API key permissions.' };
        }
        
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const data = await response.json();
      console.log('✅ SerpAPI test successful');
      
      // Check if we got valid search results
      if (data.organic_results || data.search_metadata) {
        return { success: true };
      } else if (data.error) {
        return { success: false, error: data.error };
      } else {
        console.warn('⚠️ Unexpected response format from SerpAPI:', Object.keys(data));
        return { success: false, error: 'Unexpected response format from SerpAPI' };
      }
      
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return { success: false, error: 'Request timeout - SerpAPI did not respond within 10 seconds' };
      }
      
      throw fetchError;
    }
    
  } catch (error: any) {
    console.error('💥 SerpAPI connection test exception:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { success: false, error: 'Network error: Unable to connect to SerpAPI. Please check your internet connection.' };
    }
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout - please try again' };
    }
    
    return { success: false, error: `Connection test failed: ${error.message}` };
  }
};

export const testSerpApiKeyFormat = (apiKey: string): { valid: boolean; format: string; suggestions?: string[] } => {
  const suggestions: string[] = [];
  
  if (!apiKey || typeof apiKey !== 'string') {
    return { 
      valid: false, 
      format: 'Invalid input',
      suggestions: ['Please provide a valid API key string'] 
    };
  }
  
  const cleanKey = apiKey.trim();
  
  if (!cleanKey) {
    return { 
      valid: false, 
      format: 'Empty key',
      suggestions: ['Please enter your SerpAPI key'] 
    };
  }
  
  console.log('🔍 Analyzing SERP API key format:', {
    length: cleanKey.length,
    pattern: cleanKey.replace(/[A-Za-z0-9]/g, 'X').substring(0, 20),
    startsWithSk: cleanKey.startsWith('sk-'),
    isHex: /^[a-f0-9]+$/i.test(cleanKey)
  });
  
  // Check common patterns - updated to be more permissive
  if (cleanKey.match(/^[a-f0-9]{64}$/)) {
    return { valid: true, format: '64-character hexadecimal (most common SerpAPI format)' };
  }
  
  if (cleanKey.match(/^[a-f0-9]{32}$/)) {
    return { valid: true, format: '32-character hexadecimal' };
  }
  
  if (cleanKey.match(/^[A-Za-z0-9_-]{32,}$/)) {
    return { valid: true, format: 'Alphanumeric with special characters (32+ chars)' };
  }
  
  if (cleanKey.match(/^[A-Za-z0-9]{20,}$/)) {
    return { valid: true, format: 'Alphanumeric (20+ characters)' };
  }
  
  // Accept any reasonable key format
  if (cleanKey.length >= 16 && cleanKey.length <= 128 && !cleanKey.includes(' ') && /^[A-Za-z0-9_.-]+$/.test(cleanKey)) {
    return { valid: true, format: 'Valid API key format' };
  }
  
  // Invalid format - provide suggestions
  if (cleanKey.length < 16) {
    suggestions.push('SerpAPI keys are typically 20-64 characters long');
  }
  
  if (cleanKey.length > 128) {
    suggestions.push('SerpAPI keys are typically under 128 characters');
  }
  
  if (cleanKey.includes(' ')) {
    suggestions.push('Remove any spaces from the API key');
  }
  
  if (!cleanKey.match(/^[A-Za-z0-9_.-]+$/)) {
    suggestions.push('SerpAPI keys typically contain only letters, numbers, hyphens, underscores, and dots');
  }
  
  if (cleanKey.startsWith('sk-')) {
    suggestions.push('This appears to be an OpenAI API key, not a SerpAPI key');
  }
  
  return { 
    valid: false, 
    format: 'Unknown or invalid format',
    suggestions 
  };
};

/**
 * Enhanced comprehensive test that tries multiple approaches
 */
export const testSerpApiKeyComprehensive = async (apiKey: string): Promise<{
  formatTest: { valid: boolean; format: string; suggestions?: string[] };
  connectionTest: { success: boolean; error?: string };
  recommendations: string[];
}> => {
  console.log('🔬 Running comprehensive SERP API key test with enhanced diagnostics');
  
  const recommendations: string[] = [];
  
  // Test format first
  const formatTest = testSerpApiKeyFormat(apiKey);
  
  if (!formatTest.valid) {
    recommendations.push('Fix the API key format first before testing connection');
    if (formatTest.suggestions) {
      recommendations.push(...formatTest.suggestions);
    }
    
    return {
      formatTest,
      connectionTest: { success: false, error: 'Skipped due to invalid format' },
      recommendations
    };
  }
  
  // Test connection
  const connectionTest = await testSerpApiConnection(apiKey);
  
  if (connectionTest.success) {
    recommendations.push('API key is working correctly!');
  } else {
    recommendations.push('API key format is valid but connection failed');
    if (connectionTest.error) {
      recommendations.push(`Connection error: ${connectionTest.error}`);
    }
    
    // Provide specific troubleshooting steps
    if (connectionTest.error?.includes('401') || connectionTest.error?.includes('Invalid API key')) {
      recommendations.push('Double-check that you copied the API key correctly from SerpAPI dashboard');
      recommendations.push('Verify that your SerpAPI account is active and not suspended');
    } else if (connectionTest.error?.includes('429') || connectionTest.error?.includes('rate limit')) {
      recommendations.push('Your API key is valid but you have exceeded the rate limit');
      recommendations.push('Wait a few minutes before testing again or upgrade your plan');
    } else if (connectionTest.error?.includes('Network error')) {
      recommendations.push('Check your internet connection and try again');
    }
  }
  
  return {
    formatTest,
    connectionTest,
    recommendations
  };
};

/**
 * Test API key with automatic provider detection and comprehensive error handling
 */
export async function testApiKeyWithAutoDetection(apiKey: string): Promise<ApiKeyTestResult> {
  console.log('🔍 Testing API key with automatic provider detection...');
  
  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      provider: 'unknown',
      keyLength: 0,
      formatValid: false,
      connectionValid: false,
      error: 'API key is required'
    };
  }
  
  const cleanKey = apiKey.trim();
  
  // Import detection function dynamically to avoid circular dependencies
  let detectedProvider: string | null = null;
  let alternativeProviders: string[] = [];
  
  try {
    const { detectApiKeyType, debugApiKeyFormat } = await import('@/services/apiKeys/validation');
    detectedProvider = detectApiKeyType(cleanKey);
    
    // Get debug info for alternative providers
    const debugResults = debugApiKeyFormat(cleanKey);
    alternativeProviders = Object.entries(debugResults)
      .filter(([_, result]) => result.matches)
      .map(([provider]) => provider);
      
  } catch (error) {
    console.error('❌ Error during provider detection:', error);
  }
  
  const result: ApiKeyTestResult = {
    success: false,
    provider: detectedProvider || 'unknown',
    keyLength: cleanKey.length,
    formatValid: false,
    connectionValid: false,
    details: {
      detectedProvider,
      alternativeProviders,
      suggestions: []
    }
  };
  
  if (!detectedProvider) {
    result.error = 'Could not automatically detect API key provider';
    result.details!.suggestions = [
      'Please select the correct provider manually',
      'Verify that the API key was copied correctly',
      `Key length: ${cleanKey.length} characters`
    ];
    
    if (cleanKey.startsWith('sk-')) {
      result.details!.suggestions.push('Appears to be an OpenAI or Anthropic key');
    }
    
    return result;
  }
  
  // Test the detected provider
  try {
    const { validateApiKeyFormat } = await import('@/services/apiKeys/validation');
    result.formatValid = validateApiKeyFormat(detectedProvider as any, cleanKey);
    
    if (result.formatValid) {
      // Test connection if format is valid
      const { testApiKey } = await import('@/services/apiKeys/testing');
      result.connectionValid = await testApiKey(detectedProvider as any, cleanKey);
      result.success = result.connectionValid;
      
      if (result.success) {
        result.details!.suggestions = ['API key is working correctly!'];
      } else {
        result.error = `${detectedProvider} API key format is valid but connection test failed`;
        result.details!.suggestions = [
          'Verify the API key has proper permissions',
          'Check that your account is active',
          'Try again in a few minutes if rate limited'
        ];
      }
    } else {
      result.error = `Invalid ${detectedProvider} API key format`;
      result.details!.suggestions = [
        `Expected ${detectedProvider} key format not matched`,
        'Double-check the API key was copied correctly',
        'Verify you selected the correct provider'
      ];
    }
  } catch (error: any) {
    result.error = `Error testing ${detectedProvider} API key: ${error.message}`;
  }
  
  return result;
}
