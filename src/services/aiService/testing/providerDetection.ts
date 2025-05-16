
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
  
  // OpenAI API keys start with "sk-"
  if (key.startsWith('sk-')) {
    return 'openai';
  } 
  
  // Gemini/Google API keys often start with "AIza"
  else if (key.startsWith('AIza')) {
    return 'gemini';
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
  switch (provider) {
    case 'openai':
      return 'OpenAI';
    case 'gemini':
      return 'Google Gemini';
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}
