
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getApiKey } from "../apiKeys/crud";
import { AiApiParams, AiChatParams, AiChatResponse, AiCompletionParams, AiCompletionResponse, AiProvider } from "./types";
import { getDefaultModel } from "./models";
import { handleApiError, attemptProviderFallback } from "./errorHandling";

/**
 * Send a chat request to an AI provider with fallback support
 */
export async function sendChatRequest(
  provider: AiProvider,
  params: Omit<AiChatParams, 'model'>
): Promise<AiChatResponse | null> {
  try {
    console.log(`Sending chat request to primary provider: ${provider}`);
    
    const defaultModel = getDefaultModel(provider);
    if (!defaultModel) {
      console.error(`No default model found for provider: ${provider}`);
      toast.error(`Configuration error: No default model for ${provider}`);
      return null;
    }

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

    const fullParams: AiChatParams = {
      ...params,
      model: defaultModel.id
    };

    // Call the AI proxy function
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
 */
export async function generateCompletion(
  provider: AiProvider,
  params: Omit<AiCompletionParams, 'model'>
): Promise<AiCompletionResponse | null> {
  try {
    console.log(`Generating completion with primary provider: ${provider}`);
    
    const defaultModel = getDefaultModel(provider);
    if (!defaultModel) {
      console.error(`No default model found for provider: ${provider}`);
      toast.error(`Configuration error: No default model for ${provider}`);
      return null;
    }
    
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

    const fullParams: AiCompletionParams = {
      ...params,
      model: defaultModel.id
    };

    // Call the AI proxy function
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
 * Generate content using the content generator edge function
 */
export async function generateContent(params: {
  contentType: string;
  title: string;
  outline?: any[];
  keywords?: string[];
  mainKeyword?: string;
  solution?: any;
  additionalInstructions?: string;
  userId: string;
}): Promise<{ content: string; usage?: any } | null> {
  try {
    console.log('🚀 Generating content via edge function');
    
    const { data, error } = await supabase.functions.invoke('content-generator', {
      body: JSON.stringify(params)
    });

    if (error) {
      console.error('Content generation error:', error);
      toast.error('Failed to generate content');
      return null;
    }

    if (data?.error) {
      console.error('Content generation error:', data.error);
      toast.error(data.details || 'Failed to generate content');
      return null;
    }

    console.log('✅ Content generated successfully');
    return data;
  } catch (error) {
    console.error('Content generation error:', error);
    toast.error('Failed to generate content');
    return null;
  }
}

/**
 * Analyze SEO using the SEO analyzer edge function
 */
export async function analyzeSEO(params: {
  content: string;
  mainKeyword?: string;
  keywords?: string[];
  apiKey: string;
}): Promise<any | null> {
  try {
    console.log('🔍 Analyzing SEO via edge function');
    
    const { data, error } = await supabase.functions.invoke('seo-analyzer', {
      body: JSON.stringify(params)
    });

    if (error) {
      console.error('SEO analysis error:', error);
      toast.error('Failed to analyze SEO');
      return null;
    }

    if (data?.error) {
      console.error('SEO analysis error:', data.error);
      toast.error(data.details || 'Failed to analyze SEO');
      return null;
    }

    console.log('✅ SEO analysis completed');
    return data;
  } catch (error) {
    console.error('SEO analysis error:', error);
    toast.error('Failed to analyze SEO');
    return null;
  }
}

/**
 * Low-level function to make a custom AI API call with fallback support
 */
export { callAiApi } from './genericApiCalls';
