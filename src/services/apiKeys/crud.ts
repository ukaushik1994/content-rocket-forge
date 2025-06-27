
// CRUD operations for API keys using the main apiKeyService functions
import { getApiKey, saveApiKey, deleteApiKey, ApiProvider } from '../apiKeyService';

// Re-export the main functions for consistency
export { getApiKey, saveApiKey, deleteApiKey };
export type { ApiProvider };

/**
 * Check if an API key exists for a provider
 */
export async function hasApiKey(provider: ApiProvider): Promise<boolean> {
  const key = await getApiKey(provider);
  return !!key;
}

/**
 * Get status of all API keys
 */
export async function getAllApiKeysStatus(): Promise<Record<string, boolean>> {
  const providers: ApiProvider[] = ['serp', 'serpstack', 'openai', 'anthropic', 'gemini', 'mistral', 'lmstudio'];
  const status: Record<string, boolean> = {};

  for (const provider of providers) {
    status[provider] = await hasApiKey(provider);
  }

  return status;
}
