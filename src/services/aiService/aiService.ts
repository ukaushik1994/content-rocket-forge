
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getApiKey } from "../apiKeys/crud";
import { AiApiParams, AiChatParams, AiChatResponse, AiCompletionParams, AiCompletionResponse, AiProvider } from "./types";
import { getDefaultModel } from "./models";
import { handleApiError, attemptProviderFallback } from "./errorHandling";

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
      return await attemptProviderFallback(
        provider, 
        new Error(`${provider} API key not configured`),
        params,
        'chat'
      );
    }

    // Add model to params
    const fullParams: AiChatParams = {
      ...params,
      model: defaultModel.id
    };

    // Call the new AI proxy function
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: JSON.stringify({
        service: provider,
        endpoint: 'chat',
        params: fullParams,
        apiKey
      }),
    });

    if (error) {
      return await handleApiError(provider, error, params, 'chat');
    }

    return data as AiChatResponse;
  } catch (error: any) {
    return handleApiError(provider, error, params, 'chat');
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
      return await attemptProviderFallback(
        provider, 
        new Error(`${provider} API key not configured`),
        params,
        'completion'
      );
    }

    // Add model to params
    const fullParams: AiCompletionParams = {
      ...params,
      model: defaultModel.id
    };

    // Call the new AI proxy function
    const { data, error } = await supabase.functions.invoke('ai-proxy', {
      body: JSON.stringify({
        service: provider,
        endpoint: 'completion',
        params: fullParams,
        apiKey
      }),
    });

    if (error) {
      return await handleApiError(provider, error, params, 'completion');
    }

    return data as AiCompletionResponse;
  } catch (error: any) {
    return handleApiError(provider, error, params, 'completion');
  }
}

/**
 * Low-level function to make a custom AI API call with fallback support
 */
export { callAiApi } from './genericApiCalls';
