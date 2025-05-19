
/**
 * Utility for testing DataForSEO API keys
 */
export const testDataForSeoApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  
  try {
    // For now, just check if the API key exists and has minimal length
    return apiKey.length > 10;
  } catch (error) {
    console.error('Error testing DataForSEO key:', error);
    return false;
  }
};
