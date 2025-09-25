import { indexedDB } from '@/utils/indexedDB';

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  namespace?: string; // Cache namespace
  strategy?: 'lru' | 'fifo' | 'ttl'; // Eviction strategy
  compression?: boolean; // Enable compression
}

export interface CacheEntry<T = any> {
  key: string;
  data: T | string; // Allow string for compressed data
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  compressed?: boolean;
  dependencies?: string[];
  version?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
  memoryUsage: number;
  storageUsage: number;
  lastClearTime?: number;
}

class UnifiedCacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalEntries: 0,
    memoryUsage: 0,
    storageUsage: 0
  };
  private readonly maxMemorySize = 50 * 1024 * 1024; // 50MB
  private readonly cleanupInterval = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.startCleanupTimer();
    this.loadStatsFromStorage();
  }

  async get<T>(key: string, config: CacheConfig = {}): Promise<T | null> {
    const namespacedKey = this.getNamespacedKey(key, config.namespace);
    
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(namespacedKey);
    if (memoryEntry && this.isValidEntry(memoryEntry)) {
      this.updateAccessStats(memoryEntry);
      this.stats.hits++;
      return this.decompressData<T>(memoryEntry.data, memoryEntry.compressed);
    }

    // Try localStorage
    try {
      const localData = localStorage.getItem(`cache_${namespacedKey}`);
      if (localData) {
        const entry: CacheEntry<T> = JSON.parse(localData);
        if (this.isValidEntry(entry)) {
          this.updateAccessStats(entry);
          this.stats.hits++;
          // Promote to memory cache
          this.memoryCache.set(namespacedKey, entry);
          return this.decompressData<T>(entry.data, entry.compressed);
        }
      }
    } catch (error) {
      console.warn('Error reading from localStorage cache:', error);
    }

    // Try IndexedDB
    try {
      const dbEntry = await indexedDB.getItem<CacheEntry>(namespacedKey);
      if (dbEntry && this.isValidEntry(dbEntry)) {
        this.updateAccessStats(dbEntry);
        this.stats.hits++;
        // Promote to memory and localStorage
        this.memoryCache.set(namespacedKey, dbEntry);
        this.saveToLocalStorage(namespacedKey, dbEntry);
        return this.decompressData<T>(dbEntry.data, dbEntry.compressed);
      }
    } catch (error) {
      console.warn('Error reading from IndexedDB cache:', error);
    }

    this.stats.misses++;
    this.updateHitRate();
    return null;
  }

  async set<T>(key: string, data: T, config: CacheConfig = {}): Promise<void> {
    const namespacedKey = this.getNamespacedKey(key, config.namespace);
    const ttl = config.ttl || 3600000; // Default 1 hour
    const compressed = config.compression && this.shouldCompress(data);
    const processedData = compressed ? this.compressData(data) : data;

    const entry: CacheEntry<T> = {
      key: namespacedKey,
      data: processedData,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      compressed,
      dependencies: [],
      version: '1.0'
    };

    // Store in memory cache
    this.memoryCache.set(namespacedKey, entry);

    // Store in localStorage (smaller items)
    const dataSize = JSON.stringify(entry).length;
    if (dataSize < 100 * 1024) { // 100KB limit for localStorage
      this.saveToLocalStorage(namespacedKey, entry);
    }

    // Store in IndexedDB (larger items)
    try {
      await indexedDB.setItem(namespacedKey, entry, ttl);
    } catch (error) {
      console.warn('Error saving to IndexedDB cache:', error);
    }

    this.stats.totalEntries++;
    this.enforceMemoryLimit();
    this.updateStats();
  }

  async delete(key: string, config: CacheConfig = {}): Promise<boolean> {
    const namespacedKey = this.getNamespacedKey(key, config.namespace);
    
    let deleted = false;
    
    // Remove from memory cache
    if (this.memoryCache.delete(namespacedKey)) {
      deleted = true;
    }

    // Remove from localStorage
    try {
      localStorage.removeItem(`cache_${namespacedKey}`);
      deleted = true;
    } catch (error) {
      console.warn('Error removing from localStorage cache:', error);
    }

    // Remove from IndexedDB
    try {
      await indexedDB.removeItem(namespacedKey);
      deleted = true;
    } catch (error) {
      console.warn('Error removing from IndexedDB cache:', error);
    }

    if (deleted) {
      this.stats.totalEntries = Math.max(0, this.stats.totalEntries - 1);
      this.updateStats();
    }

    return deleted;
  }

  async clear(namespace?: string): Promise<void> {
    if (namespace) {
      // Clear specific namespace
      const prefix = `${namespace}:`;
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          this.memoryCache.delete(key);
        }
      }
      
      // Clear from localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith(`cache_${prefix}`)) {
          localStorage.removeItem(key);
        }
      }
    } else {
      // Clear all
      this.memoryCache.clear();
      
      // Clear localStorage cache entries
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      }
    }

    // Clear IndexedDB
    try {
      await indexedDB.clearAll();
    } catch (error) {
      console.warn('Error clearing IndexedDB cache:', error);
    }

    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalEntries: 0,
      memoryUsage: 0,
      storageUsage: 0,
      lastClearTime: Date.now()
    };
    this.saveStatsToStorage();
  }

  async invalidateDependencies(dependencies: string[]): Promise<void> {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.dependencies?.some(dep => dependencies.includes(dep))) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key.replace(/^[^:]+:/, ''));
    }
  }

  async warmCache(keys: Array<{ key: string; fetcher: () => Promise<any>; config?: CacheConfig }>): Promise<void> {
    const promises = keys.map(async ({ key, fetcher, config = {} }) => {
      const existing = await this.get(key, config);
      if (!existing) {
        try {
          const data = await fetcher();
          await this.set(key, data, config);
        } catch (error) {
          console.warn(`Failed to warm cache for key ${key}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  private getNamespacedKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : `default:${key}`;
  }

  private isValidEntry(entry: CacheEntry): boolean {
    const now = Date.now();
    return now - entry.timestamp < entry.ttl;
  }

  private updateAccessStats(entry: CacheEntry): void {
    entry.accessCount++;
    entry.lastAccessed = Date.now();
  }

  private shouldCompress(data: any): boolean {
    const dataSize = JSON.stringify(data).length;
    return dataSize > 1024; // Compress if larger than 1KB
  }

  private compressData(data: any): string {
    // Simple compression simulation - in reality, use a proper compression library
    return JSON.stringify(data);
  }

  private decompressData<T>(data: any, compressed?: boolean): T {
    if (compressed && typeof data === 'string') {
      try {
        return JSON.parse(data) as T;
      } catch {
        // If parsing fails, return original data
        return data as T;
      }
    }
    return data as T;
  }

  private saveToLocalStorage(key: string, entry: CacheEntry): void {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Error saving to localStorage cache:', error);
    }
  }

  private enforceMemoryLimit(): void {
    if (this.getMemoryUsage() > this.maxMemorySize) {
      const entries = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
      
      // Remove oldest 25% of entries
      const toRemove = Math.ceil(entries.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        this.memoryCache.delete(entries[i][0]);
      }
    }
  }

  private getMemoryUsage(): number {
    let size = 0;
    for (const entry of this.memoryCache.values()) {
      size += JSON.stringify(entry).length * 2; // Rough estimate
    }
    return size;
  }

  private updateStats(): void {
    this.stats.memoryUsage = this.getMemoryUsage();
    this.stats.totalEntries = this.memoryCache.size;
    this.updateHitRate();
    this.saveStatsToStorage();
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  private saveStatsToStorage(): void {
    try {
      localStorage.setItem('cache_stats', JSON.stringify(this.stats));
    } catch (error) {
      console.warn('Error saving cache stats:', error);
    }
  }

  private loadStatsFromStorage(): void {
    try {
      const stored = localStorage.getItem('cache_stats');
      if (stored) {
        this.stats = { ...this.stats, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Error loading cache stats:', error);
    }
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.cleanupInterval);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.memoryCache.delete(key);
    }

    if (expiredKeys.length > 0) {
      this.updateStats();
    }
  }
}

export const cacheService = new UnifiedCacheService();