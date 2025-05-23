
/**
 * Utility functions for testing API key functionality
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
  // SerpAPI keys typically start with specific patterns
  const serpApiPatterns = [
    /^[a-f0-9]{64}$/, // 64-character hex string
    /^[A-Za-z0-9_-]{32,}$/ // Base64-like string
  ];
  
  return serpApiPatterns.some(pattern => pattern.test(apiKey));
};

export const testSerpApiConnection = async (apiKey: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Use the unified Supabase edge function for testing
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('serp-api', {
      body: {
        endpoint: 'search',
        params: { q: 'test', limit: 1 },
        apiKey
      }
    });
    
    if (error) {
      return { success: false, error: `Connection test failed: ${error.message}` };
    }
    
    if (data && !data.error) {
      return { success: true };
    } else {
      return { success: false, error: `API test failed: ${data?.error || 'Unknown error'}` };
    }
  } catch (error: any) {
    return { success: false, error: `Connection test failed: ${error.message}` };
  }
};
