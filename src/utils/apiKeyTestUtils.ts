
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
    console.log('🧪 Testing direct SerpAPI connection with key length:', apiKey.length);
    
    // Make a minimal test request to SerpAPI directly
    const testUrl = 'https://serpapi.com/search';
    const params = new URLSearchParams({
      api_key: apiKey,
      engine: 'google',
      q: 'test',
      num: '1'
    });
    
    const response = await fetch(`${testUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentBuilder/1.0)',
      }
    });
    
    console.log('📊 Direct SerpAPI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Direct SerpAPI error response:', errorText);
      
      // Parse error response
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          return { success: false, error: errorData.error };
        }
      } catch (parseError) {
        // If not JSON, use the raw text
        return { success: false, error: errorText };
      }
      
      // Provide specific error messages based on status
      if (response.status === 401) {
        return { success: false, error: 'Invalid API key. Please check your SerpAPI key.' };
      }
      
      if (response.status === 429) {
        return { success: false, error: 'API rate limit exceeded. Please try again later.' };
      }
      
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
    
    const data = await response.json();
    console.log('✅ Direct SerpAPI test successful');
    
    // Check if we got valid search results
    if (data.organic_results || data.search_metadata) {
      return { success: true };
    } else if (data.error) {
      return { success: false, error: data.error };
    } else {
      return { success: false, error: 'Unexpected response format from SerpAPI' };
    }
    
  } catch (error: any) {
    console.error('💥 Direct SerpAPI connection test exception:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { success: false, error: 'Network error: Unable to connect to SerpAPI' };
    }
    
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
 * Enhanced unified test that tries the API key through both edge function and direct API
 */
export const testSerpApiKeyComprehensive = async (apiKey: string): Promise<{
  edgeFunction: { success: boolean; error?: string };
  directApi: { success: boolean; error?: string };
  format: { valid: boolean; format: string; suggestions?: string[] };
}> => {
  console.log('🔬 Running comprehensive SERP API key test');
  
  // Test format first
  const formatTest = testSerpApiKeyFormat(apiKey);
  
  // Test through edge function
  let edgeFunctionResult: { success: boolean; error?: string } = { success: false, error: 'Not tested' };
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('serp-api', {
      body: {
        endpoint: 'search',
        params: { q: 'test', limit: 1 },
        apiKey
      }
    });
    
    if (error) {
      edgeFunctionResult = { success: false, error: error.message };
    } else if (data && !data.error) {
      edgeFunctionResult = { success: true };
    } else {
      edgeFunctionResult = { success: false, error: data?.error || 'Unknown edge function error' };
    }
  } catch (error: any) {
    edgeFunctionResult = { success: false, error: `Edge function test failed: ${error.message}` };
  }
  
  // Test direct API
  const directApiResult = await testSerpApiConnection(apiKey);
  
  return {
    edgeFunction: edgeFunctionResult,
    directApi: directApiResult,
    format: formatTest
  };
};
