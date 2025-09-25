/**
 * IndexedDB utilities for offline data storage
 */

const DB_NAME = 'creaiter-offline-db';
const DB_VERSION = 1;

export interface OfflineData {
  id?: number;
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

export interface SyncQueueItem {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
  retryCount?: number;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Offline data store
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
          store.createIndex('key', 'key', { unique: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('url', 'url', { unique: false });
        }

        // Conversations cache
        if (!db.objectStoreNames.contains('conversations')) {
          const store = db.createObjectStore('conversations', { keyPath: 'id' });
          store.createIndex('user_id', 'user_id', { unique: false });
          store.createIndex('updated_at', 'updated_at', { unique: false });
        }

        // Workflows cache
        if (!db.objectStoreNames.contains('workflows')) {
          const store = db.createObjectStore('workflows', { keyPath: 'id' });
          store.createIndex('user_id', 'user_id', { unique: false });
          store.createIndex('updated_at', 'updated_at', { unique: false });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  /**
   * Store data with optional expiration
   */
  async setItem(key: string, data: any, expiresInMs?: number): Promise<void> {
    const store = await this.getStore('offlineData', 'readwrite');
    
    const item: OfflineData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: expiresInMs ? Date.now() + expiresInMs : undefined
    };

    return new Promise((resolve, reject) => {
      // First try to update existing item
      const getRequest = store.index('key').get(key);
      
      getRequest.onsuccess = () => {
        const existingItem = getRequest.result;
        
        if (existingItem) {
          item.id = existingItem.id;
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          const addRequest = store.add(item);
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = () => reject(addRequest.error);
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Get data by key
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    const store = await this.getStore('offlineData');
    
    return new Promise((resolve, reject) => {
      const request = store.index('key').get(key);
      
      request.onsuccess = () => {
        const item = request.result as OfflineData;
        
        if (!item) {
          resolve(null);
          return;
        }

        // Check expiration
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this.removeItem(key); // Clean up expired item
          resolve(null);
          return;
        }

        resolve(item.data);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove data by key
   */
  async removeItem(key: string): Promise<void> {
    const store = await this.getStore('offlineData', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.index('key').get(key);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          const deleteRequest = store.delete(item.id);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Clear expired items
   */
  async clearExpired(): Promise<void> {
    const store = await this.getStore('offlineData', 'readwrite');
    const now = Date.now();
    
    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          const item = cursor.value as OfflineData;
          if (item.expiresAt && now > item.expiresAt) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store conversation for offline access
   */
  async storeConversation(conversation: any): Promise<void> {
    const store = await this.getStore('conversations', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...conversation,
        cached_at: Date.now()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached conversations
   */
  async getCachedConversations(userId: string): Promise<any[]> {
    const store = await this.getStore('conversations');
    
    return new Promise((resolve, reject) => {
      const request = store.index('user_id').getAll(userId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store workflow for offline access
   */
  async storeWorkflow(workflow: any): Promise<void> {
    const store = await this.getStore('workflows', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.put({
        ...workflow,
        cached_at: Date.now()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached workflows
   */
  async getCachedWorkflows(userId: string): Promise<any[]> {
    const store = await this.getStore('workflows');
    
    return new Promise((resolve, reject) => {
      const request = store.index('user_id').getAll(userId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>): Promise<void> {
    const store = await this.getStore('syncQueue', 'readwrite');
    
    const queueItem: SyncQueueItem = {
      ...item,
      timestamp: Date.now(),
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const request = store.add(queueItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get sync queue items
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const store = await this.getStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(id: number): Promise<void> {
    const store = await this.getStore('syncQueue', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update sync queue item retry count
   */
  async incrementRetryCount(id: number): Promise<void> {
    const store = await this.getStore('syncQueue', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.retryCount = (item.retryCount || 0) + 1;
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    const storeNames = ['offlineData', 'syncQueue', 'conversations', 'workflows'];
    
    await Promise.all(storeNames.map(async (storeName) => {
      const store = await this.getStore(storeName, 'readwrite');
      return new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }));
  }

  /**
   * Get storage usage info
   */
  async getStorageInfo(): Promise<{
    offlineDataCount: number;
    syncQueueCount: number;
    conversationsCount: number;
    workflowsCount: number;
  }> {
    const [offlineData, syncQueue, conversations, workflows] = await Promise.all([
      this.getStore('offlineData').then(store => 
        new Promise<number>((resolve, reject) => {
          const request = store.count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })
      ),
      this.getStore('syncQueue').then(store => 
        new Promise<number>((resolve, reject) => {
          const request = store.count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })
      ),
      this.getStore('conversations').then(store => 
        new Promise<number>((resolve, reject) => {
          const request = store.count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })
      ),
      this.getStore('workflows').then(store => 
        new Promise<number>((resolve, reject) => {
          const request = store.count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })
      )
    ]);

    return {
      offlineDataCount: offlineData,
      syncQueueCount: syncQueue,
      conversationsCount: conversations,
      workflowsCount: workflows
    };
  }
}

// Export singleton instance
export const indexedDB = new IndexedDBManager();