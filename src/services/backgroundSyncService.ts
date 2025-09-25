/**
 * Background sync service for offline data synchronization
 */

import { indexedDB, SyncQueueItem } from '@/utils/indexedDB';

export interface SyncResult {
  success: boolean;
  error?: string;
  retryAfter?: number;
}

class BackgroundSyncService {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private maxRetries: number = 3;
  private baseRetryDelay: number = 1000; // 1 second

  constructor() {
    this.setupNetworkListeners();
    this.schedulePeriodicSync();
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('[BackgroundSync] Network online - attempting sync');
      this.isOnline = true;
      this.syncPendingRequests();
    });

    window.addEventListener('offline', () => {
      console.log('[BackgroundSync] Network offline');
      this.isOnline = false;
    });
  }

  private schedulePeriodicSync(): void {
    // Sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingRequests();
      }
    }, 30000);
  }

  /**
   * Queue a request for background sync
   */
  async queueRequest(
    url: string,
    method: string,
    headers: Record<string, string> = {},
    body?: string
  ): Promise<void> {
    console.log('[BackgroundSync] Queuing request:', { url, method });
    
    await indexedDB.addToSyncQueue({
      url,
      method,
      headers,
      body: body || ''
    });

    // Try immediate sync if online
    if (this.isOnline) {
      this.syncPendingRequests();
    }
  }

  /**
   * Process all pending sync requests
   */
  async syncPendingRequests(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log('[BackgroundSync] Starting sync process');

    try {
      const queueItems = await indexedDB.getSyncQueue();
      console.log(`[BackgroundSync] Found ${queueItems.length} items to sync`);

      for (const item of queueItems) {
        if (item.retryCount && item.retryCount >= this.maxRetries) {
          console.warn('[BackgroundSync] Max retries reached for:', item.url);
          await indexedDB.removeFromSyncQueue(item.id!);
          continue;
        }

        const result = await this.syncRequest(item);
        
        if (result.success) {
          console.log('[BackgroundSync] Successfully synced:', item.url);
          await indexedDB.removeFromSyncQueue(item.id!);
        } else {
          console.warn('[BackgroundSync] Sync failed for:', item.url, result.error);
          await indexedDB.incrementRetryCount(item.id!);
          
          // Wait before next retry
          if (result.retryAfter) {
            await this.delay(result.retryAfter);
          }
        }
      }
    } catch (error) {
      console.error('[BackgroundSync] Sync process error:', error);
    } finally {
      this.syncInProgress = false;
      console.log('[BackgroundSync] Sync process completed');
    }
  }

  /**
   * Sync a single request
   */
  private async syncRequest(item: SyncQueueItem): Promise<SyncResult> {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body || undefined
      });

      if (response.ok) {
        return { success: true };
      } else if (response.status >= 400 && response.status < 500) {
        // Client error - don't retry
        return { 
          success: false, 
          error: `Client error: ${response.status}` 
        };
      } else {
        // Server error - retry with exponential backoff
        const retryCount = item.retryCount || 0;
        const retryDelay = this.baseRetryDelay * Math.pow(2, retryCount);
        
        return { 
          success: false, 
          error: `Server error: ${response.status}`,
          retryAfter: retryDelay
        };
      }
    } catch (error) {
      // Network error - retry
      const retryCount = item.retryCount || 0;
      const retryDelay = this.baseRetryDelay * Math.pow(2, retryCount);
      
      return { 
        success: false, 
        error: `Network error: ${error}`,
        retryAfter: retryDelay
      };
    }
  }

  /**
   * Clear all pending sync requests
   */
  async clearSyncQueue(): Promise<void> {
    const queueItems = await indexedDB.getSyncQueue();
    await Promise.all(
      queueItems.map(item => indexedDB.removeFromSyncQueue(item.id!))
    );
    console.log('[BackgroundSync] Sync queue cleared');
  }

  /**
   * Get sync queue status
   */
  async getSyncStatus(): Promise<{
    pendingCount: number;
    isOnline: boolean;
    syncInProgress: boolean;
  }> {
    const queueItems = await indexedDB.getSyncQueue();
    
    return {
      pendingCount: queueItems.length,
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress
    };
  }

  /**
   * Force sync attempt (even if offline)
   */
  async forcSync(): Promise<void> {
    console.log('[BackgroundSync] Force sync requested');
    this.syncInProgress = false; // Reset flag
    await this.syncPendingRequests();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const backgroundSyncService = new BackgroundSyncService();

// Helper functions for common operations
export const syncHelpers = {
  /**
   * Queue a conversation update for sync
   */
  async queueConversationUpdate(conversationId: string, data: any): Promise<void> {
    await backgroundSyncService.queueRequest(
      `/api/conversations/${conversationId}`,
      'PUT',
      { 'Content-Type': 'application/json' },
      JSON.stringify(data)
    );
  },

  /**
   * Queue a workflow update for sync
   */
  async queueWorkflowUpdate(workflowId: string, data: any): Promise<void> {
    await backgroundSyncService.queueRequest(
      `/api/workflows/${workflowId}`,
      'PUT',
      { 'Content-Type': 'application/json' },
      JSON.stringify(data)
    );
  },

  /**
   * Queue a new message for sync
   */
  async queueMessageCreate(conversationId: string, message: any): Promise<void> {
    await backgroundSyncService.queueRequest(
      `/api/conversations/${conversationId}/messages`,
      'POST',
      { 'Content-Type': 'application/json' },
      JSON.stringify(message)
    );
  },

  /**
   * Queue analytics event for sync
   */
  async queueAnalyticsEvent(event: any): Promise<void> {
    await backgroundSyncService.queueRequest(
      '/api/analytics/events',
      'POST',
      { 'Content-Type': 'application/json' },
      JSON.stringify(event)
    );
  }
};