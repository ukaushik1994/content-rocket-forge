
/**
 * Enhanced utility functions for testing API key functionality
 */

export const testApiKeyDecryption = (encryptedKey: string): string | null => {
  try {
    // Test if the key is base64 encoded
    if (encryptedKey.match(/^[A-Za-z0-9+/]+=*$/)) {
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

export const validateSerpApiKey = (apiKey: string): boolean => {
  // Updated SerpAPI key patterns - more permissive to match real SerpAPI keys
  const serpApiPatterns = [
    /^[a-f0-9]{64}$/, // 64-character hex string (most common)
    /^[a-f0-9]{32}$/, // 32-character hex string
    /^[A-Za-z0-9_-]{32,}$/, // Base64-like string (32+ chars)
    /^[A-Za-z0-9]{20,}$/, // 20+ character alphanumeric
    /^[A-Za-z0-9_.-]{16,}$/ // 16+ chars with common special characters
  ];
  
  return serpApiPatterns.some(pattern => pattern.test(apiKey));
};

export const testSerpApiConnection = async (apiKey: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🧪 Testing SerpAPI connection through edge function with key length:', apiKey.length);
    
    // Test through our edge function to avoid CORS issues
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('serp-api', {
      body: {
        endpoint: 'search',
        params: { 
          q: 'test query',
          num: 1
        },
        apiKey
      }
    });
    
    console.log('📊 Edge function response:', { data, error });
    
    if (error) {
      console.error('❌ Edge function error:', error);
      return { success: false, error: error.message };
    }
    
    if (data && !data.error) {
      console.log('✅ SerpAPI connection test successful through edge function');
      return { success: true };
    } else {
      console.error('❌ SerpAPI returned error:', data?.error);
      return { success: false, error: data?.error || 'Unknown API error' };
    }
    
  } catch (error: any) {
    console.error('💥 SerpAPI connection test exception:', error);
    return { success: false, error: `Connection test failed: ${error.message}` };
  }
};

export const testSerpApiKeyFormat = (apiKey: string): { valid: boolean; format: string; suggestions?: string[] } => {
  const suggestions: string[] = [];
  
  // Check common patterns - updated to be more permissive
  if (apiKey.match(/^[a-f0-9]{64}$/)) {
    return { valid: true, format: '64-character hexadecimal (most common SerpAPI format)' };
  }
  
  if (apiKey.match(/^[a-f0-9]{32}$/)) {
    return { valid: true, format: '32-character hexadecimal' };
  }
  
  if (apiKey.match(/^[A-Za-z0-9_-]{32,}$/)) {
    return { valid: true, format: 'Alphanumeric with special characters (32+ chars)' };
  }
  
  if (apiKey.match(/^[A-Za-z0-9]{20,}$/)) {
    return { valid: true, format: 'Alphanumeric (20+ characters)' };
  }
  
  // Accept any reasonable key format
  if (apiKey.length >= 16 && !apiKey.includes(' ') && apiKey.match(/^[A-Za-z0-9_.-]+$/)) {
    return { valid: true, format: 'Valid API key format' };
  }
  
  // Invalid format - provide suggestions
  if (apiKey.length < 16) {
    suggestions.push('SerpAPI keys are typically 20-64 characters long');
  }
  
  if (apiKey.includes(' ')) {
    suggestions.push('Remove any spaces from the API key');
  }
  
  if (!apiKey.match(/^[A-Za-z0-9_.-]+$/)) {
    suggestions.push('SerpAPI keys typically contain only letters, numbers, hyphens, underscores, and dots');
  }
  
  return { 
    valid: false, 
    format: 'Unknown or invalid format',
    suggestions 
  };
};

/**
 * Enhanced unified test that validates and tests the API key through edge function
 */
export const testSerpApiKeyComprehensive = async (apiKey: string): Promise<{
  edgeFunction: { success: boolean; error?: string };
  format: { valid: boolean; format: string; suggestions?: string[] };
}> => {
  console.log('🔬 Running comprehensive SERP API key test');
  
  // Test format first
  const formatTest = testSerpApiKeyFormat(apiKey);
  
  // Test through edge function
  const edgeFunctionResult = await testSerpApiConnection(apiKey);
  
  return {
    edgeFunction: edgeFunctionResult,
    format: formatTest
  };
};
