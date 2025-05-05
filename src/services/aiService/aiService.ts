
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getApiKey } from "../apiKeys/crud";
import { AiApiParams, AiChatParams, AiChatResponse, AiCompletionParams, AiCompletionResponse, AiProvider } from "./types";
import { getDefaultModel } from "./models";
import { handleProviderError, getFallbackConfig, notifyProviderFallback } from "./providerFallback";

/**
 * Send a chat request to an AI provider with fallback support
 * @param provider The AI provider to use
 * @param params The chat parameters
 * @returns A promise that resolves to the AI response
 */
export async function sendChatRequest(
  provider: AiProvider,
  params: Omit<AiChatParams, 'model'>
): Promise<AiChatResponse | null> {
  try {
    console.log(`Sending chat request to primary provider: ${provider}`);
    
    // Get default model if not specified
    const defaultModel = getDefaultModel(provider);
    if (!defaultModel) {
      console.error(`No default model found for provider: ${provider}`);
      toast.error(`Configuration error: No default model for ${provider}`);
      return null;
    }

    // Get API key for the provider
    const apiKey = await getApiKey(provider);
    if (!apiKey) {
      console.warn(`${provider.toUpperCase()} API key not configured. Please configure your API key in Settings.`);
      
      // Get fallback configuration
      const { enabled, fallbackProviders } = getFallbackConfig();
      
      if (enabled && fallbackProviders.length > 0) {
        // Try fallback providers
        return handleProviderError(provider, new Error(`${provider} API key not configured`), 
          async () => {
            for (const fallbackProvider of fallbackProviders) {
              console.log(`Attempting fallback to: ${fallbackProvider}`);
              const fallbackApiKey = await getApiKey(fallbackProvider);
              
              if (fallbackApiKey) {
                notifyProviderFallback(provider, fallbackProvider);
                return sendChatRequest(fallbackProvider, params);
              }
            }
            toast.error('No AI provider is configured. Please add at least one API key in Settings.');
            return null;
          }
        );
      }
      
      toast.warning(`${provider.toUpperCase()} API key not configured. Configure your API keys in Settings.`);
      return null;
    }

    // Add model to params
    const fullParams: AiChatParams = {
      ...params,
      model: defaultModel.id
    };

    // Call the API proxy
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify({
        service: provider,
        endpoint: 'chat',
        params: fullParams,
        apiKey
      }),
    });

    if (error) {
      // Handle error with fallback
      const { enabled, fallbackProviders } = getFallbackConfig();
      
      if (enabled && fallbackProviders.length > 0) {
        return handleProviderError(provider, error, 
          async () => {
            for (const fallbackProvider of fallbackProviders) {
              console.log(`Attempting fallback to: ${fallbackProvider}`);
              const fallbackApiKey = await getApiKey(fallbackProvider);
              
              if (fallbackApiKey) {
                notifyProviderFallback(provider, fallbackProvider);
                return sendChatRequest(fallbackProvider, params);
              }
            }
            return null;
          }
        );
      } else {
        console.error(`Error calling ${provider} API:`, error);
        toast.error(`API error: ${error.message || 'Unknown error'}`);
        return null;
      }
    }

    return data as AiChatResponse;
  } catch (error: any) {
    return handleProviderError(provider, error);
  }
}

/**
 * Generate a completion using an AI provider with fallback support
 * @param provider The AI provider to use
 * @param params The completion parameters
 * @returns A promise that resolves to the AI response
 */
export async function generateCompletion(
  provider: AiProvider,
  params: Omit<AiCompletionParams, 'model'>
): Promise<AiCompletionResponse | null> {
  try {
    console.log(`Generating completion with primary provider: ${provider}`);
    
    // Get default model if not specified
    const defaultModel = getDefaultModel(provider);
    if (!defaultModel) {
      console.error(`No default model found for provider: ${provider}`);
      toast.error(`Configuration error: No default model for ${provider}`);
      return null;
    }
    
    // Get API key for the provider
    const apiKey = await getApiKey(provider);
    if (!apiKey) {
      console.warn(`${provider.toUpperCase()} API key not configured. Please configure your API key in Settings.`);
      
      // Get fallback configuration
      const { enabled, fallbackProviders } = getFallbackConfig();
      
      if (enabled && fallbackProviders.length > 0) {
        // Try fallback providers
        return handleProviderError(provider, new Error(`${provider} API key not configured`), 
          async () => {
            for (const fallbackProvider of fallbackProviders) {
              console.log(`Attempting fallback to: ${fallbackProvider}`);
              const fallbackApiKey = await getApiKey(fallbackProvider);
              
              if (fallbackApiKey) {
                notifyProviderFallback(provider, fallbackProvider);
                return generateCompletion(fallbackProvider, params);
              }
            }
            toast.error('No AI provider is configured. Please add at least one API key in Settings.');
            return null;
          }
        );
      }
      
      toast.warning(`${provider.toUpperCase()} API key not configured. Configure your API keys in Settings.`);
      return null;
    }

    // Add model to params
    const fullParams: AiCompletionParams = {
      ...params,
      model: defaultModel.id
    };

    // Call the API proxy
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify({
        service: provider,
        endpoint: 'completion',
        params: fullParams,
        apiKey
      }),
    });

    if (error) {
      // Handle error with fallback
      const { enabled, fallbackProviders } = getFallbackConfig();
      
      if (enabled && fallbackProviders.length > 0) {
        return handleProviderError(provider, error, 
          async () => {
            for (const fallbackProvider of fallbackProviders) {
              console.log(`Attempting fallback to: ${fallbackProvider}`);
              const fallbackApiKey = await getApiKey(fallbackProvider);
              
              if (fallbackApiKey) {
                notifyProviderFallback(provider, fallbackProvider);
                return generateCompletion(fallbackProvider, params);
              }
            }
            return null;
          }
        );
      } else {
        console.error(`Error calling ${provider} API:`, error);
        toast.error(`API error: ${error.message || 'Unknown error'}`);
        return null;
      }
    }

    return data as AiCompletionResponse;
  } catch (error: any) {
    return handleProviderError(provider, error);
  }
}

/**
 * Low-level function to make a custom AI API call with fallback support
 * @param config The API configuration
 * @returns A promise that resolves to the API response
 */
export async function callAiApi<T>(config: AiApiParams): Promise<T | null> {
  try {
    console.log(`Calling AI API with provider: ${config.provider}`);
    
    // Get the API key if not provided in the config
    const apiKey = config.apiKey || await getApiKey(config.provider);
    const hasApiKey = !!apiKey;
    
    if (!hasApiKey) {
      console.warn(`${config.provider.toUpperCase()} API key not configured. Please configure your API key in Settings.`);
      
      // Get fallback configuration and check if we should try fallback
      const { enabled, fallbackProviders } = getFallbackConfig();
      
      if (enabled && config.provider && fallbackProviders.length > 0) {
        // Try fallback providers
        return handleProviderError(config.provider as AiProvider, new Error(`${config.provider} API key not configured`), 
          async () => {
            for (const fallbackProvider of fallbackProviders) {
              console.log(`Attempting fallback to: ${fallbackProvider}`);
              const fallbackApiKey = await getApiKey(fallbackProvider);
              
              if (fallbackApiKey) {
                notifyProviderFallback(config.provider as AiProvider, fallbackProvider);
                return callAiApi<T>({
                  ...config,
                  provider: fallbackProvider
                });
              }
            }
            toast.error('No AI provider is configured. Please add at least one API key in Settings.');
            return null;
          }
        );
      }
      
      toast.warning(`${config.provider.toUpperCase()} API key not configured. Configure your API keys in Settings.`);
      return null;
    }
    
    // Call the API proxy
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      body: JSON.stringify({
        ...config,
        apiKey,
        hasApiKey
      }),
    });
    
    if (error) {
      // Handle error with fallback
      const { enabled, fallbackProviders } = getFallbackConfig();
      
      if (enabled && config.provider && fallbackProviders.length > 0) {
        return handleProviderError(config.provider as AiProvider, error, 
          async () => {
            for (const fallbackProvider of fallbackProviders) {
              console.log(`Attempting fallback to: ${fallbackProvider}`);
              const fallbackApiKey = await getApiKey(fallbackProvider);
              
              if (fallbackApiKey) {
                notifyProviderFallback(config.provider as AiProvider, fallbackProvider);
                return callAiApi<T>({
                  ...config,
                  provider: fallbackProvider
                });
              }
            }
            return null;
          }
        );
      } else {
        console.error(`Error calling ${config.provider} API:`, error);
        toast.error(`API error: ${error.message || 'Unknown error'}`);
        return null;
      }
    }
    
    return data as T;
  } catch (error: any) {
    if (config.provider) {
      return handleProviderError(config.provider as AiProvider, error);
    } else {
      console.error(`Error calling AI API:`, error);
      toast.error(`API error: ${error.message || 'Unknown error'}`);
      return null;
    }
  }
}
