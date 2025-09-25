/**
 * Simplified PWA Cache Service - handles only caching without updates
 */

class PWACacheService {
  private registration: ServiceWorkerRegistration | null = null;
  private hasInitialized = false;

  constructor() {
    this.initializeServiceWorker();
  }

  /**
   * Initialize service worker
   */
  private async initializeServiceWorker(): Promise<void> {
    if (this.hasInitialized || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      console.log('[PWACache] Initializing service worker...');
      
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[PWACache] Service worker registered successfully');
      this.hasInitialized = true;
      
    } catch (error) {
      console.error('[PWACache] Service worker registration failed:', error);
    }
  }

  /**
   * Setup basic service worker listeners
   */
  private setupBasicListeners(): void {
    if (!this.registration) return;

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'SW_UPDATED':
          console.log('[PWACache] Service worker updated to version:', data?.version);
          break;
      }
    });
  }

  /**
   * Clear all caches
   */
  public async clearCaches(): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.warn('[PWACache] No active service worker available');
      return;
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          console.log('[PWACache] Caches cleared successfully');
          resolve();
        } else {
          reject(new Error('Failed to clear caches'));
        }
      };
      
      this.registration!.active!.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
      
      // Timeout after 10 seconds
      setTimeout(() => reject(new Error('Cache clearing timeout')), 10000);
    });
  }

  /**
   * Get storage estimate
   */
  public async getStorageEstimate(): Promise<StorageEstimate | null> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return null;
    }

    try {
      return await navigator.storage.estimate();
    } catch (error) {
      console.error('[PWACache] Failed to get storage estimate:', error);
      return null;
    }
  }
}

// Export singleton instance
export const pwaUpdateService = new PWACacheService();