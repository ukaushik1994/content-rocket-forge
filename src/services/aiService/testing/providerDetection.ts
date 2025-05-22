
import { AiProvider } from "../types";

/**
 * Detect the type of AI API key based on its format
 * @param key The API key to detect
 * @returns A promise that resolves to the provider name or null
 */
export async function detectAiKeyType(key: string): Promise<AiProvider | null> {
  // Basic key pattern detection
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return null;
  }
  
  // OpenAI API keys start with "sk-" but not "sk-ant-"
  if (key.startsWith('sk-') && !key.startsWith('sk-ant-')) {
    return 'openai';
  } 
  
  // Anthropic API keys start with "sk-ant-"
  else if (key.startsWith('sk-ant-')) {
    return 'anthropic';
  } 
  
  // Gemini/Google API keys often start with "AIza"
  else if (key.startsWith('AIza')) {
    return 'gemini';
  }
  
  // LM Studio uses a URL format (http://localhost:port)
  else if (key.startsWith('http://') || key.startsWith('https://')) {
    return 'lmstudio';
  }
  
  // Unknown format
  return null;
}

/**
 * Get a friendly name for an AI provider
 * @param provider The provider identifier
 * @returns The friendly name
 */
export function getProviderFriendlyName(provider: AiProvider): string {
  if (!provider) {
    return 'Unknown Provider';
  }
  
  switch (provider) {
    case 'openai':
      return 'OpenAI';
    case 'anthropic':
      return 'Anthropic';
    case 'gemini':
      return 'Google Gemini';
    case 'mistral':
      return 'Mistral AI';
    case 'lmstudio':
      return 'LM Studio';
    default:
      // Safely handle cases where provider might not be a string
      return typeof provider === 'string' ? 
        provider.charAt(0).toUpperCase() + provider.slice(1) : 
        'Unknown Provider';
  }
}
