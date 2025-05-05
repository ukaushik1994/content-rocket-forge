
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getApiKey } from "../apiKeys/crud";
import { AiApiParams, AiChatParams, AiChatResponse, AiCompletionParams, AiCompletionResponse } from "./types";
import { getDefaultModel } from "./models";

/**
 * Send a chat request to an AI provider
 * @param provider The AI provider to use
 * @param params The chat parameters
 * @returns A promise that resolves to the AI response
 */
export async function sendChatRequest(
  provider: 'openai' | 'anthropic' | 'gemini',
  params: Omit<AiChatParams, 'model'>
): Promise<AiChatResponse | null> {
  try {
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
      console.error(`Error calling ${provider} API:`, error);
      toast.error(`API error: ${error.message || 'Unknown error'}`);
      return null;
    }

    return data as AiChatResponse;
  } catch (error: any) {
    console.error(`Error sending chat request to ${provider}:`, error);
    toast.error(`Chat request error: ${error.message || 'Unknown error'}`);
    return null;
  }
}

/**
 * Generate a completion using an AI provider
 * @param provider The AI provider to use
 * @param params The completion parameters
 * @returns A promise that resolves to the AI response
 */
export async function generateCompletion(
  provider: 'openai' | 'anthropic' | 'gemini',
  params: Omit<AiCompletionParams, 'model'>
): Promise<AiCompletionResponse | null> {
  try {
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
      console.error(`Error calling ${provider} API:`, error);
      toast.error(`API error: ${error.message || 'Unknown error'}`);
      return null;
    }

    return data as AiCompletionResponse;
  } catch (error: any) {
    console.error(`Error generating completion with ${provider}:`, error);
    toast.error(`Completion error: ${error.message || 'Unknown error'}`);
    return null;
  }
}

/**
 * Low-level function to make a custom AI API call
 * @param config The API configuration
 * @returns A promise that resolves to the API response
 */
export async function callAiApi<T>(config: AiApiParams): Promise<T | null> {
  try {
    // Get the API key if not provided in the config
    const apiKey = config.apiKey || await getApiKey(config.provider);
    const hasApiKey = !!apiKey;
    
    if (!hasApiKey) {
      console.warn(`${config.provider.toUpperCase()} API key not configured. Please configure your API key in Settings.`);
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
      console.error(`Error calling ${config.provider} API:`, error);
      toast.error(`API error: ${error.message || 'Unknown error'}`);
      return null;
    }
    
    return data as T;
  } catch (error: any) {
    console.error(`Error calling ${config.provider} API:`, error);
    toast.error(`API error: ${error.message || 'Unknown error'}`);
    return null;
  }
}
