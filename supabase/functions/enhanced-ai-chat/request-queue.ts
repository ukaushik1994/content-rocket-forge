/**
 * Request Queue for AI calls
 * Spaces out requests to prevent rate limit issues
 */

class RequestQueue {
  private queue: Array<{fn: () => Promise<any>, resolve: any, reject: any}> = [];
  private processing = false;
  private minDelay = 2000; // Minimum 2 seconds between requests
  private lastRequestTime = 0;
  
  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      console.log(`📋 Request queued (queue size: ${this.queue.length})`);
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }
  
  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    console.log('🔄 Starting queue processing');
    
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      // Ensure minimum delay between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minDelay) {
        const waitTime = this.minDelay - timeSinceLastRequest;
        console.log(`⏳ Spacing requests: waiting ${waitTime}ms`);
        await new Promise(r => setTimeout(r, waitTime));
      }
      
      try {
        console.log(`🚀 Processing queued request (${this.queue.length} remaining)`);
        const result = await item.fn();
        this.lastRequestTime = Date.now();
        item.resolve(result);
      } catch (error) {
        console.error('❌ Queued request failed:', error);
        this.lastRequestTime = Date.now();
        item.reject(error);
      }
      
      // Small additional delay if more items in queue
      if (this.queue.length > 0) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
    
    this.processing = false;
    console.log('✅ Queue processing complete');
  }
}

export const aiRequestQueue = new RequestQueue();
