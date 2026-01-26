/**
 * API Error Resilience Service
 * Provides graceful fallbacks, rate limit handling, and intelligent retry logic
 */

import { toast } from 'sonner';

export type ApiProvider = 'serp' | 'serpstack' | 'openai' | 'anthropic' | 'gemini';
export type ApiErrorType = 'RATE_LIMIT' | 'QUOTA_EXCEEDED' | 'AUTH_ERROR' | 'NETWORK_ERROR' | 'SERVICE_UNAVAILABLE' | 'UNKNOWN';

export interface ApiError {
  type: ApiErrorType;
  provider: ApiProvider;
  message: string;
  retryAfter?: number; // seconds
  canFallback: boolean;
  fallbackProvider?: ApiProvider;
  originalError?: unknown;
}

export interface RateLimitState {
  provider: ApiProvider;
  limitedUntil: number; // timestamp
  consecutiveErrors: number;
}

// In-memory rate limit state (persists during session)
const rateLimitState: Map<ApiProvider, RateLimitState> = new Map();

// Fallback chain for SERP providers
const SERP_FALLBACK_CHAIN: ApiProvider[] = ['serp', 'serpstack'];

/**
 * Parse error response and classify the error type
 */
export function classifyApiError(error: unknown, provider: ApiProvider): ApiError {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();
  
  // Rate limit detection
  if (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('429') ||
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('exceeded the maximum rate')
  ) {
    return {
      type: 'RATE_LIMIT',
      provider,
      message: `${provider.toUpperCase()} rate limit reached. Please wait before retrying.`,
      retryAfter: extractRetryAfter(message) || 60,
      canFallback: isSerpProvider(provider),
      fallbackProvider: getNextFallbackProvider(provider),
      originalError: error
    };
  }
  
  // Quota exceeded
  if (
    lowerMessage.includes('quota') ||
    lowerMessage.includes('usage limit') ||
    lowerMessage.includes('exceeded your')
  ) {
    return {
      type: 'QUOTA_EXCEEDED',
      provider,
      message: `${provider.toUpperCase()} quota exceeded. Consider upgrading your plan.`,
      canFallback: isSerpProvider(provider),
      fallbackProvider: getNextFallbackProvider(provider),
      originalError: error
    };
  }
  
  // Auth errors
  if (
    lowerMessage.includes('invalid') && lowerMessage.includes('key') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('authentication') ||
    lowerMessage.includes('401')
  ) {
    return {
      type: 'AUTH_ERROR',
      provider,
      message: `${provider.toUpperCase()} API key is invalid. Please check your settings.`,
      canFallback: false,
      originalError: error
    };
  }
  
  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('fetch failed') ||
    lowerMessage.includes('econnrefused')
  ) {
    return {
      type: 'NETWORK_ERROR',
      provider,
      message: `Network error connecting to ${provider.toUpperCase()}. Please check your connection.`,
      retryAfter: 5,
      canFallback: true,
      fallbackProvider: getNextFallbackProvider(provider),
      originalError: error
    };
  }
  
  // Service unavailable
  if (
    lowerMessage.includes('503') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('service unavailable') ||
    lowerMessage.includes('temporarily unavailable')
  ) {
    return {
      type: 'SERVICE_UNAVAILABLE',
      provider,
      message: `${provider.toUpperCase()} service is temporarily unavailable.`,
      retryAfter: 30,
      canFallback: isSerpProvider(provider),
      fallbackProvider: getNextFallbackProvider(provider),
      originalError: error
    };
  }
  
  return {
    type: 'UNKNOWN',
    provider,
    message: message || `Unknown error with ${provider.toUpperCase()}`,
    canFallback: false,
    originalError: error
  };
}

/**
 * Check if a provider is currently rate limited
 */
export function isProviderRateLimited(provider: ApiProvider): boolean {
  const state = rateLimitState.get(provider);
  if (!state) return false;
  
  if (Date.now() < state.limitedUntil) {
    return true;
  }
  
  // Clear expired rate limit
  rateLimitState.delete(provider);
  return false;
}

/**
 * Get remaining rate limit cooldown in seconds
 */
export function getRateLimitCooldown(provider: ApiProvider): number {
  const state = rateLimitState.get(provider);
  if (!state) return 0;
  
  const remaining = Math.ceil((state.limitedUntil - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

/**
 * Record a rate limit error for a provider
 */
export function recordRateLimitError(provider: ApiProvider, retryAfterSeconds: number = 60): void {
  const existing = rateLimitState.get(provider);
  const consecutiveErrors = (existing?.consecutiveErrors || 0) + 1;
  
  // Exponential backoff for consecutive errors
  const adjustedCooldown = retryAfterSeconds * Math.min(Math.pow(1.5, consecutiveErrors - 1), 4);
  
  rateLimitState.set(provider, {
    provider,
    limitedUntil: Date.now() + (adjustedCooldown * 1000),
    consecutiveErrors
  });
  
  console.log(`⏰ Rate limit recorded for ${provider}: ${adjustedCooldown}s cooldown (${consecutiveErrors} consecutive errors)`);
}

/**
 * Clear rate limit state for a provider (e.g., after successful call)
 */
export function clearRateLimitState(provider: ApiProvider): void {
  rateLimitState.delete(provider);
}

/**
 * Get the best available SERP provider (not rate limited)
 */
export function getAvailableSerpProvider(): ApiProvider | null {
  for (const provider of SERP_FALLBACK_CHAIN) {
    if (!isProviderRateLimited(provider)) {
      return provider;
    }
  }
  return null;
}

/**
 * Get all providers with their current status
 */
export function getProviderStatuses(): Array<{
  provider: ApiProvider;
  isLimited: boolean;
  cooldownSeconds: number;
}> {
  return SERP_FALLBACK_CHAIN.map(provider => ({
    provider,
    isLimited: isProviderRateLimited(provider),
    cooldownSeconds: getRateLimitCooldown(provider)
  }));
}

/**
 * Show user-friendly error notification
 */
export function notifyApiError(error: ApiError): void {
  const getToastVariant = () => {
    switch (error.type) {
      case 'RATE_LIMIT':
      case 'QUOTA_EXCEEDED':
        return 'warning' as const;
      case 'AUTH_ERROR':
        return 'error' as const;
      default:
        return 'error' as const;
    }
  };

  const getActionHint = () => {
    switch (error.type) {
      case 'RATE_LIMIT':
        return error.retryAfter 
          ? `Try again in ${formatDuration(error.retryAfter)}.`
          : 'Please wait before retrying.';
      case 'QUOTA_EXCEEDED':
        return 'Consider upgrading your API plan.';
      case 'AUTH_ERROR':
        return 'Check your API key in Settings.';
      case 'NETWORK_ERROR':
        return 'Check your internet connection.';
      case 'SERVICE_UNAVAILABLE':
        return 'The service should recover shortly.';
      default:
        return 'Please try again later.';
    }
  };

  const variant = getToastVariant();
  
  if (variant === 'warning') {
    toast.warning(`${error.provider.toUpperCase()} API Issue`, {
      description: `${error.message} ${getActionHint()}`,
      duration: 5000
    });
  } else {
    toast.error(`${error.provider.toUpperCase()} API Error`, {
      description: `${error.message} ${getActionHint()}`,
      duration: 5000
    });
  }
}

/**
 * Execute with automatic fallback for SERP providers
 */
export async function executeWithFallback<T>(
  primaryFn: (provider: ApiProvider) => Promise<T>,
  options: {
    primaryProvider: ApiProvider;
    onFallback?: (from: ApiProvider, to: ApiProvider) => void;
    skipRateLimited?: boolean;
  }
): Promise<T> {
  const { primaryProvider, onFallback, skipRateLimited = true } = options;
  
  // Check if primary is rate limited
  if (skipRateLimited && isProviderRateLimited(primaryProvider)) {
    const fallback = getNextFallbackProvider(primaryProvider);
    if (fallback && !isProviderRateLimited(fallback)) {
      console.log(`⏭️ Skipping rate-limited ${primaryProvider}, using ${fallback}`);
      onFallback?.(primaryProvider, fallback);
      return primaryFn(fallback);
    }
    
    // All providers rate limited
    const cooldown = getRateLimitCooldown(primaryProvider);
    throw new Error(`All SERP providers are rate limited. Please wait ${formatDuration(cooldown)}.`);
  }
  
  try {
    const result = await primaryFn(primaryProvider);
    clearRateLimitState(primaryProvider);
    return result;
  } catch (error) {
    const apiError = classifyApiError(error, primaryProvider);
    
    // Record rate limit
    if (apiError.type === 'RATE_LIMIT' || apiError.type === 'QUOTA_EXCEEDED') {
      recordRateLimitError(primaryProvider, apiError.retryAfter);
    }
    
    // Try fallback if available
    if (apiError.canFallback && apiError.fallbackProvider) {
      const fallback = apiError.fallbackProvider;
      
      if (!isProviderRateLimited(fallback)) {
        console.log(`🔄 Falling back from ${primaryProvider} to ${fallback}`);
        onFallback?.(primaryProvider, fallback);
        
        try {
          const result = await primaryFn(fallback);
          clearRateLimitState(fallback);
          return result;
        } catch (fallbackError) {
          const fallbackApiError = classifyApiError(fallbackError, fallback);
          if (fallbackApiError.type === 'RATE_LIMIT' || fallbackApiError.type === 'QUOTA_EXCEEDED') {
            recordRateLimitError(fallback, fallbackApiError.retryAfter);
          }
          notifyApiError(fallbackApiError);
          throw fallbackError;
        }
      }
    }
    
    notifyApiError(apiError);
    throw error;
  }
}

// === Helper Functions ===

function isSerpProvider(provider: ApiProvider): boolean {
  return provider === 'serp' || provider === 'serpstack';
}

function getNextFallbackProvider(current: ApiProvider): ApiProvider | undefined {
  const idx = SERP_FALLBACK_CHAIN.indexOf(current);
  if (idx === -1 || idx >= SERP_FALLBACK_CHAIN.length - 1) {
    // Wrap around or try the other provider
    return SERP_FALLBACK_CHAIN.find(p => p !== current);
  }
  return SERP_FALLBACK_CHAIN[idx + 1];
}

function extractRetryAfter(message: string): number | null {
  // Try to extract retry-after from error message
  const match = message.match(/(\d+)\s*(second|minute|sec|min)/i);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    return unit.startsWith('min') ? value * 60 : value;
  }
  return null;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
