import { useState, useEffect, useCallback } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';

interface WorkflowCacheEntry {
  workflowType: string;
  result: any;
  timestamp: number;
  userId: string;
  context: any;
}

interface WorkflowCacheOptions {
  maxAge?: number; // milliseconds
  maxEntries?: number;
  enableOfflineMode?: boolean;
}

export const useWorkflowCache = (options: WorkflowCacheOptions = {}) => {
  const {
    maxAge = 30 * 60 * 1000, // 30 minutes default
    maxEntries = 50,
    enableOfflineMode = true
  } = options;

  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    totalEntries: 0
  });

  const getCacheKey = (workflowType: string, userId: string, context?: any) => {
    const contextHash = context ? btoa(JSON.stringify(context)).slice(0, 16) : 'default';
    return `workflow_${workflowType}_${userId}_${contextHash}`;
  };

  const getCachedResult = useCallback((workflowType: string, userId: string, context?: any) => {
    try {
      const cacheKey = getCacheKey(workflowType, userId, context);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
        return null;
      }

      const entry: WorkflowCacheEntry = JSON.parse(cached);
      
      // Check if entry is expired
      if (Date.now() - entry.timestamp > maxAge) {
        localStorage.removeItem(cacheKey);
        setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
        return null;
      }

      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return entry.result;
    } catch (error) {
      console.error('Error reading from workflow cache:', error);
      return null;
    }
  }, [maxAge]);

  const setCachedResult = useCallback((workflowType: string, userId: string, result: any, context?: any) => {
    try {
      const cacheKey = getCacheKey(workflowType, userId, context);
      const entry: WorkflowCacheEntry = {
        workflowType,
        result,
        timestamp: Date.now(),
        userId,
        context
      };

      localStorage.setItem(cacheKey, JSON.stringify(entry));
      
      // Clean up old entries if we exceed max entries
      cleanupOldEntries();
      
      updateCacheStats();
    } catch (error) {
      console.error('Error writing to workflow cache:', error);
    }
  }, [maxEntries]);

  const cleanupOldEntries = useCallback(() => {
    try {
      const allKeys = Object.keys(localStorage).filter(key => key.startsWith('workflow_'));
      
      if (allKeys.length <= maxEntries) return;

      // Get all entries with timestamps
      const entries = allKeys.map(key => {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          return { key, timestamp: entry.timestamp || 0 };
        } catch {
          return { key, timestamp: 0 };
        }
      }).sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest entries
      const entriesToRemove = entries.slice(0, entries.length - maxEntries);
      entriesToRemove.forEach(({ key }) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error cleaning up workflow cache:', error);
    }
  }, [maxEntries]);

  const clearExpiredEntries = useCallback(() => {
    try {
      const allKeys = Object.keys(localStorage).filter(key => key.startsWith('workflow_'));
      const now = Date.now();
      
      allKeys.forEach(key => {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          if (now - (entry.timestamp || 0) > maxAge) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      });

      updateCacheStats();
    } catch (error) {
      console.error('Error clearing expired entries:', error);
    }
  }, [maxAge]);

  const updateCacheStats = useCallback(() => {
    try {
      const allKeys = Object.keys(localStorage).filter(key => key.startsWith('workflow_'));
      setCacheStats(prev => ({ ...prev, totalEntries: allKeys.length }));
    } catch (error) {
      console.error('Error updating cache stats:', error);
    }
  }, []);

  const clearCache = useCallback((workflowType?: string, userId?: string) => {
    try {
      if (workflowType && userId) {
        // Clear specific workflow type for user
        const pattern = `workflow_${workflowType}_${userId}_`;
        Object.keys(localStorage)
          .filter(key => key.startsWith(pattern))
          .forEach(key => localStorage.removeItem(key));
      } else if (userId) {
        // Clear all workflows for user
        const pattern = `workflow_${userId}_`;
        Object.keys(localStorage)
          .filter(key => key.includes(pattern))
          .forEach(key => localStorage.removeItem(key));
      } else {
        // Clear all workflow cache
        Object.keys(localStorage)
          .filter(key => key.startsWith('workflow_'))
          .forEach(key => localStorage.removeItem(key));
      }

      updateCacheStats();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [updateCacheStats]);

  const getCacheEntries = useCallback(() => {
    try {
      const allKeys = Object.keys(localStorage).filter(key => key.startsWith('workflow_'));
      return allKeys.map(key => {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          return {
            key,
            workflowType: entry.workflowType,
            timestamp: entry.timestamp,
            userId: entry.userId,
            age: Date.now() - (entry.timestamp || 0)
          };
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('Error getting cache entries:', error);
      return [];
    }
  }, []);

  const isResultCached = useCallback((workflowType: string, userId: string, context?: any) => {
    return getCachedResult(workflowType, userId, context) !== null;
  }, [getCachedResult]);

  // Auto-cleanup expired entries periodically
  useEffect(() => {
    const interval = setInterval(clearExpiredEntries, 5 * 60 * 1000); // Every 5 minutes
    updateCacheStats();
    
    return () => clearInterval(interval);
  }, [clearExpiredEntries, updateCacheStats]);

  // Handle offline/online events
  useEffect(() => {
    if (!enableOfflineMode) return;

    const handleOnline = () => {
      console.log('Online: Workflow cache available');
    };

    const handleOffline = () => {
      console.log('Offline: Using cached workflow results');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableOfflineMode]);

  return {
    getCachedResult,
    setCachedResult,
    clearCache,
    clearExpiredEntries,
    getCacheEntries,
    isResultCached,
    cacheStats
  };
};