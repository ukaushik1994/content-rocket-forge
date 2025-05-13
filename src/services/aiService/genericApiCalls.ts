// src/services/aiService/genericApiCalls.ts

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getApiKey } from "../apiKeys/crud";
import { AiApiParams, AiProvider } from "./types";
import { getFallbackConfig, notifyProviderFallback } from "./providerFallback";

/**
 * Perform an API call to an AI provider, with:
 *  • Built-in retries on 429
 *  • Provider fallback on auth/failure
 *  • Single exit with toast if no provider works
 */
export async function callAiApi<T>(
  config: AiApiParams,
  retries = 3,
  backoffMs = 1000
): Promise<T | null> {
  const { provider } = config;
  const apiKey = await getApiKey(provider);

  if (!apiKey) {
    toast.error(`No API key for provider "${provider}"`);
    return null;
  }

  try {
    console.log(`Calling AI API [${provider}] with model ${config.model}`);
    // assume fetch-based call inside
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(config.payload),
    });

    if (response.status === 429 && retries > 0) {
      // Rate limited: wait & retry
      console.warn(
        `Rate limited by ${provider}. Retrying in ${backoffMs}ms...`,
        `(${retries} retries left)`
      );
      await new Promise((r) => setTimeout(r, backoffMs));
      return callAiApi<T>(config, retries - 1, backoffMs * 2);
    }

    if (!response.ok) {
      // For other errors, attempt fallback provider
      const text = await response.text().catch(() => "");
      console.error(
        `Error from ${provider}: ${response.status} ${response.statusText}`,
        text
      );
      const fallback = getFallbackConfig(provider);
      if (fallback) {
        const { nextProvider } = fallback;
        notifyProviderFallback(provider, nextProvider);
        return callAiApi<T>({ ...config, provider: nextProvider });
      }
      toast.error(`AI request failed: ${response.statusText}`);
      return null;
    }

    // All good: parse and return
    const data = (await response.json()) as T;
    return data;
  } catch (err: any) {
    // Network or unexpected error
    console.error(`Network/error calling ${provider}:`, err);
    if (err?.status === 429 && retries > 0) {
      await new Promise((r) => setTimeout(r, backoffMs));
      return callAiApi<T>(config, retries - 1, backoffMs * 2);
    }
    const fallback = getFallbackConfig(provider);
    if (fallback) {
      const { nextProvider } = fallback;
      notifyProviderFallback(provider, nextProvider);
      return callAiApi<T>({ ...config, provider: nextProvider });
    }
    toast.error("No AI provider is configured or all calls failed.");
    return null;
  }
}
