/**
 * Retry wrapper for AI Proxy calls with exponential backoff
 * Handles 429 (rate limit), 500, 502, 503 errors automatically
 */

const RETRYABLE_STATUS_CODES = [429, 500, 502, 503];

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

export async function callAiProxyWithRetry(
  url: string,
  options: RequestInit,
  retryOpts: RetryOptions = {}
): Promise<Response> {
  const { maxRetries = 3, baseDelay = 2000, maxDelay = 16000 } = retryOpts;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If success or non-retryable error, return immediately
      if (response.ok || !RETRYABLE_STATUS_CODES.includes(response.status)) {
        return response;
      }

      // Retryable status code — only retry if we have attempts left
      if (attempt === maxRetries) {
        return response; // Return the failed response on last attempt
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay) + Math.random() * 1000;
      console.log(`⚠️ AI Proxy returned ${response.status} (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay.toFixed(0)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay) + Math.random() * 1000;
      console.log(`⚠️ AI Proxy fetch error (attempt ${attempt + 1}/${maxRetries + 1}): ${error?.message}, retrying in ${delay.toFixed(0)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('AI Proxy call failed after retries');
}
