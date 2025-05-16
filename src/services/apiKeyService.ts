
// Re-export all API key functionality from the apiKeys directory for backward compatibility

export * from './apiKeys';

// Add a function to decode the Base64 encoded API key
export const decodeApiKey = (encodedKey: string): string => {
  try {
    return atob(encodedKey);
  } catch (error) {
    console.error('Error decoding API key:', error);
    return '';
  }
};

// Add a function to detect what kind of API key this might be based on its format
export const detectApiKeyType = (apiKey: string): string | null => {
  if (!apiKey) return null;
  
  // OpenAI API keys start with "sk-"
  if (apiKey.startsWith('sk-') && apiKey.length > 30) {
    return 'openai';
  }
  
  // SERP API keys are typically alphanumeric strings
  // Previously we were checking for 32+ characters which might be too strict
  if (/^[a-zA-Z0-9]{16,}$/.test(apiKey)) {
    console.log('Detected potential SERP API key format');
    return 'serp';
  }
  
  // Some SERP APIs use custom formats
  if (/^[a-zA-Z0-9-_]{8,}$/.test(apiKey)) {
    console.log('Detected alternative SERP API key format');
    return 'serp';
  }
  
  // Anthropic API keys start with "sk-ant-"
  if (apiKey.startsWith('sk-ant-')) {
    return 'anthropic';
  }
  
  console.log('API key type not detected for:', apiKey.substring(0, 5) + '...');
  return null;
};
