/**
 * PWA update service for managing service worker updates
 */

export interface UpdateInfo {
  isUpdateAvailable: boolean;
  currentVersion?: string;
  newVersion?: string;
  canUpdate: boolean;
}

export type UpdateEventType = 'update-available' | 'update-installed' | 'update-failed';

export interface UpdateEventHandler {
  (type: UpdateEventType, info?: UpdateInfo): void;
}

class PWAUpdateService {
  private registration: ServiceWorkerRegistration | null = null;
  private updateHandlers: UpdateEventHandler[] = [];
  private updateAvailable: boolean = false;
  private newWorker: ServiceWorker | null = null;

  constructor() {
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWAUpdate] Service Worker not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[PWAUpdate] Service Worker registered');

      this.setupUpdateListeners();
      this.checkForUpdates();
      
      // Check for updates every 60 seconds
      setInterval(() => this.checkForUpdates(), 60000);
      
    } catch (error) {
      console.error('[PWAUpdate] Service Worker registration failed:', error);
    }
  }

  private setupUpdateListeners(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      console.log('[PWAUpdate] Update found');
      
      const newWorker = this.registration!.installing;
      if (!newWorker) return;

      this.newWorker = newWorker;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New update available
            console.log('[PWAUpdate] New update available');
            this.updateAvailable = true;
            this.notifyHandlers('update-available', {
              isUpdateAvailable: true,
              canUpdate: true
            });
          } else {
            // First time install
            console.log('[PWAUpdate] Service Worker installed for first time');
          }
        }
      });
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, version } = event.data;
      
      switch (type) {
        case 'SW_UPDATED':
          console.log('[PWAUpdate] Service Worker updated to version:', version);
          this.notifyHandlers('update-installed', {
            isUpdateAvailable: false,
            newVersion: version,
            canUpdate: false
          });
          break;
      }
    });

    // Handle controlling service worker change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWAUpdate] Controller changed - reloading page');
      window.location.reload();
    });
  }

  /**
   * Check for service worker updates
   */
  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('[PWAUpdate] Checked for updates');
    } catch (error) {
      console.error('[PWAUpdate] Update check failed:', error);
      this.notifyHandlers('update-failed');
    }
  }

  /**
   * Apply available update
   */
  async applyUpdate(): Promise<void> {
    if (!this.updateAvailable || !this.newWorker) {
      console.warn('[PWAUpdate] No update available to apply');
      return;
    }

    try {
      // Tell the new service worker to skip waiting
      this.newWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // The controllerchange event will trigger a page reload
      console.log('[PWAUpdate] Applying update...');
      
    } catch (error) {
      console.error('[PWAUpdate] Failed to apply update:', error);
      this.notifyHandlers('update-failed');
    }
  }

  /**
   * Get current update status
   */
  getUpdateInfo(): UpdateInfo {
    return {
      isUpdateAvailable: this.updateAvailable,
      canUpdate: this.updateAvailable && !!this.newWorker
    };
  }

  /**
   * Add update event handler
   */
  onUpdate(handler: UpdateEventHandler): () => void {
    this.updateHandlers.push(handler);
    
    // Return unsubscribe function
    return () => {
      const index = this.updateHandlers.indexOf(handler);
      if (index > -1) {
        this.updateHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Get service worker version
   */
  async getVersion(): Promise<string | null> {
    if (!this.registration || !this.registration.active) {
      return null;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version || null);
      };

      this.registration.active!.postMessage(
        { type: 'GET_VERSION' }, 
        [messageChannel.port2]
      );

      // Timeout after 5 seconds
      setTimeout(() => resolve(null), 5000);
    });
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    if (!this.registration || !this.registration.active) {
      throw new Error('Service worker not available');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve();
        } else {
          reject(new Error('Failed to clear caches'));
        }
      };

      this.registration.active!.postMessage(
        { type: 'CLEAR_CACHE' }, 
        [messageChannel.port2]
      );

      // Timeout after 10 seconds
      setTimeout(() => reject(new Error('Cache clear timeout')), 10000);
    });
  }

  /**
   * Get cache storage usage estimate
   */
  async getStorageEstimate(): Promise<StorageEstimate | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        return await navigator.storage.estimate();
      } catch (error) {
        console.error('[PWAUpdate] Storage estimate error:', error);
      }
    }
    return null;
  }

  /**
   * Request persistent storage
   */
  async requestPersistentStorage(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        return await navigator.storage.persist();
      } catch (error) {
        console.error('[PWAUpdate] Persistent storage request error:', error);
      }
    }
    return false;
  }

  private notifyHandlers(type: UpdateEventType, info?: UpdateInfo): void {
    this.updateHandlers.forEach(handler => {
      try {
        handler(type, info);
      } catch (error) {
        console.error('[PWAUpdate] Handler error:', error);
      }
    });
  }
}

// Export singleton instance
export const pwaUpdateService = new PWAUpdateService();