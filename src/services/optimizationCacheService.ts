import { OptimizationSuggestion } from '@/components/content-builder/final-review/optimization/types';
import { QualityCheckSuggestion } from '@/components/content-builder/final-review/optimization/hooks/useContentQualityIntegration';

interface CacheEntry {
  content: string;
  suggestions: OptimizationSuggestion[];
  qualitySuggestions: QualityCheckSuggestion[];
  timestamp: number;
  contentHash: string;
}

interface OptimizationCache {
  analysis: Map<string, CacheEntry>;
  optimizations: Map<string, { original: string; optimized: string; timestamp: number }>;
}

class OptimizationCacheService {
  private cache: OptimizationCache = {
    analysis: new Map(),
    optimizations: new Map()
  };
  
  private readonly CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 100;

  private generateContentHash(content: string): string {
    // Simple hash function for content
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private cleanExpiredEntries() {
    const now = Date.now();
    
    // Clean analysis cache
    for (const [key, entry] of this.cache.analysis.entries()) {
      if (now - entry.timestamp > this.CACHE_EXPIRY_MS) {
        this.cache.analysis.delete(key);
      }
    }

    // Clean optimization cache
    for (const [key, entry] of this.cache.optimizations.entries()) {
      if (now - entry.timestamp > this.CACHE_EXPIRY_MS) {
        this.cache.optimizations.delete(key);
      }
    }

    // Limit cache size
    if (this.cache.analysis.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.analysis.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      for (let i = 0; i < entries.length - this.MAX_CACHE_SIZE; i++) {
        this.cache.analysis.delete(entries[i][0]);
      }
    }
  }

  getCachedAnalysis(content: string): CacheEntry | null {
    this.cleanExpiredEntries();
    const hash = this.generateContentHash(content);
    return this.cache.analysis.get(hash) || null;
  }

  setCachedAnalysis(
    content: string, 
    suggestions: OptimizationSuggestion[], 
    qualitySuggestions: QualityCheckSuggestion[]
  ): void {
    this.cleanExpiredEntries();
    const hash = this.generateContentHash(content);
    
    this.cache.analysis.set(hash, {
      content,
      suggestions,
      qualitySuggestions,
      timestamp: Date.now(),
      contentHash: hash
    });
  }

  getCachedOptimization(originalContent: string, suggestionIds: string[]): string | null {
    this.cleanExpiredEntries();
    const key = `${this.generateContentHash(originalContent)}_${suggestionIds.sort().join('_')}`;
    const cached = this.cache.optimizations.get(key);
    return cached?.optimized || null;
  }

  setCachedOptimization(originalContent: string, suggestionIds: string[], optimizedContent: string): void {
    this.cleanExpiredEntries();
    const key = `${this.generateContentHash(originalContent)}_${suggestionIds.sort().join('_')}`;
    
    this.cache.optimizations.set(key, {
      original: originalContent,
      optimized: optimizedContent,
      timestamp: Date.now()
    });
  }

  clearCache(): void {
    this.cache.analysis.clear();
    this.cache.optimizations.clear();
  }

  getCacheStats() {
    return {
      analysisEntries: this.cache.analysis.size,
      optimizationEntries: this.cache.optimizations.size,
      totalMemoryUsage: this.calculateMemoryUsage()
    };
  }

  private calculateMemoryUsage(): number {
    let size = 0;
    
    for (const entry of this.cache.analysis.values()) {
      size += entry.content.length;
      size += JSON.stringify(entry.suggestions).length;
      size += JSON.stringify(entry.qualitySuggestions).length;
    }

    for (const entry of this.cache.optimizations.values()) {
      size += entry.original.length;
      size += entry.optimized.length;
    }

    return size;
  }
}

export const optimizationCache = new OptimizationCacheService();