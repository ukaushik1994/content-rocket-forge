
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
    const testUrl = `https://serpapi.com/search?engine=google&q=test&api_key=${apiKey}&num=1`;
    
    const response = await fetch(testUrl);
    
    if (response.ok) {
      return { success: true };
    } else {
      const errorText = await response.text();
      return { success: false, error: `API test failed: ${response.status} - ${errorText}` };
    }
  } catch (error) {
    return { success: false, error: `Connection test failed: ${error.message}` };
  }
};
