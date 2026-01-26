export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryOnRateLimit?: boolean;
  onRetry?: (attempt: number, error: Error, delay: number) => void;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Execute a function with exponential backoff retry logic
 * Now with configurable rate limit handling
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryOnRateLimit = false,
    onRetry,
    shouldRetry
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const errorMessage = error?.message?.toLowerCase() || '';
      
      // Check custom shouldRetry function first
      if (shouldRetry && !shouldRetry(lastError)) {
        throw error;
      }
      
      // Check for non-retryable errors
      const isAuthError = 
        errorMessage.includes('auth') || 
        errorMessage.includes('permission') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('invalid');
      
      const isValidationError = 
        errorMessage.includes('validation') ||
        errorMessage.includes('invalid input');
      
      const isRateLimitError = 
        errorMessage.includes('rate limit') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('429') ||
        errorMessage.includes('too many requests');
      
      // Don't retry on auth or validation errors
      if (isAuthError || isValidationError) {
        throw error;
      }
      
      // Rate limit handling depends on option
      if (isRateLimitError && !retryOnRateLimit) {
        throw error;
      }
      
      // Last attempt - throw
      if (attempt >= maxRetries - 1) {
        break;
      }
      
      // Calculate delay with jitter
      const jitter = Math.random() * 500;
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt) + jitter,
        maxDelay
      );
      
      console.log(`⚠️ Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${Math.round(delay)}ms...`);
      onRetry?.(attempt + 1, lastError, delay);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Retry specifically designed for rate-limited APIs
 * Uses longer delays and more retries
 */
export async function retryWithRateLimitBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 30000,
    backoffFactor: 2,
    retryOnRateLimit: true,
    ...options
  });
}

/**
 * Quick retry for transient errors only
 * Fails fast on rate limits and auth errors
 */
export async function quickRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries,
    initialDelay: 500,
    maxDelay: 2000,
    backoffFactor: 2,
    retryOnRateLimit: false
  });
}

