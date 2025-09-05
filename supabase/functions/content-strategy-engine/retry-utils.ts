/**
 * Retry utility with exponential backoff for rate limit handling
 */

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error
      const isRateLimit = error?.message?.includes('429') || 
                         error?.message?.includes('rate limit') ||
                         error?.message?.includes('Rate limit');
      
      // If it's the last attempt or not a rate limit error, throw
      if (attempt === maxRetries || !isRateLimit) {
        throw error;
      }
      
      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      
      console.log(`⚠️ Rate limit hit (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay.toFixed(0)}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  const errorStr = (error?.message || error?.toString() || '').toLowerCase();
  return errorStr.includes('429') || 
         errorStr.includes('rate limit') || 
         errorStr.includes('quota') ||
         errorStr.includes('too many requests');
}

/**
 * Delay execution for a specified number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}