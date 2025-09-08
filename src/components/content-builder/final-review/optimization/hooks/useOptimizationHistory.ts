import { useState, useCallback } from 'react';
import { OptimizationSuggestion } from '../types';
import { QualityCheckSuggestion } from './useContentQualityIntegration';

export interface OptimizationHistoryEntry {
  id: string;
  timestamp: number;
  action: 'apply_suggestions' | 'bulk_select' | 'manual_edit' | 'revert' | 'optimization_complete';
  before: {
    content: string;
    selectedSuggestions: string[];
  };
  after: {
    content: string;
    selectedSuggestions: string[];
  };
  metadata?: {
    appliedSuggestions?: (OptimizationSuggestion | QualityCheckSuggestion)[];
    optimizationSettings?: any;
    performanceMetrics?: any;
  };
}

export interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
  currentPosition: number;
  totalEntries: number;
  lastAction?: string;
}

export function useOptimizationHistory() {
  const [history, setHistory] = useState<OptimizationHistoryEntry[]>([]);
  const [currentPosition, setCurrentPosition] = useState(-1);

  const addHistoryEntry = useCallback((
    action: OptimizationHistoryEntry['action'],
    beforeState: { content: string; selectedSuggestions: string[] },
    afterState: { content: string; selectedSuggestions: string[] },
    metadata?: OptimizationHistoryEntry['metadata']
  ) => {
    const entry: OptimizationHistoryEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      action,
      before: beforeState,
      after: afterState,
      metadata
    };

    setHistory(prev => {
      // Remove any entries after current position (for branching)
      const newHistory = prev.slice(0, currentPosition + 1);
      newHistory.push(entry);
      
      // Limit history size to prevent memory issues
      if (newHistory.length > 50) {
        return newHistory.slice(-50);
      }
      
      return newHistory;
    });

    setCurrentPosition(prev => prev + 1);
  }, [currentPosition]);

  const undo = useCallback((): OptimizationHistoryEntry | null => {
    if (currentPosition < 0) return null;

    const entry = history[currentPosition];
    setCurrentPosition(prev => prev - 1);
    return entry;
  }, [history, currentPosition]);

  const redo = useCallback((): OptimizationHistoryEntry | null => {
    if (currentPosition >= history.length - 1) return null;

    const entry = history[currentPosition + 1];
    setCurrentPosition(prev => prev + 1);
    return entry;
  }, [history, currentPosition]);

  const getUndoRedoState = useCallback((): UndoRedoState => {
    return {
      canUndo: currentPosition >= 0,
      canRedo: currentPosition < history.length - 1,
      currentPosition,
      totalEntries: history.length,
      lastAction: history[currentPosition]?.action
    };
  }, [history, currentPosition]);

  const getHistoryPreview = useCallback((entryId: string) => {
    const entry = history.find(h => h.id === entryId);
    if (!entry) return null;

    return {
      action: entry.action,
      timestamp: entry.timestamp,
      contentChanges: {
        charactersAdded: entry.after.content.length - entry.before.content.length,
        wordsAdded: entry.after.content.split(' ').length - entry.before.content.split(' ').length,
      },
      selectionChanges: {
        added: entry.after.selectedSuggestions.filter(s => !entry.before.selectedSuggestions.includes(s)),
        removed: entry.before.selectedSuggestions.filter(s => !entry.after.selectedSuggestions.includes(s))
      },
      metadata: entry.metadata
    };
  }, [history]);

  const revertToEntry = useCallback((entryId: string): OptimizationHistoryEntry | null => {
    const entryIndex = history.findIndex(h => h.id === entryId);
    if (entryIndex === -1) return null;

    setCurrentPosition(entryIndex);
    return history[entryIndex];
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentPosition(-1);
  }, []);

  const exportHistory = useCallback(() => {
    return {
      entries: history,
      currentPosition,
      exportTimestamp: Date.now(),
      version: '1.0'
    };
  }, [history, currentPosition]);

  const importHistory = useCallback((exportedHistory: any) => {
    if (!exportedHistory.entries || !Array.isArray(exportedHistory.entries)) {
      throw new Error('Invalid history format');
    }

    setHistory(exportedHistory.entries);
    setCurrentPosition(exportedHistory.currentPosition ?? exportedHistory.entries.length - 1);
  }, []);

  const getOptimizationStats = useCallback(() => {
    const stats = {
      totalOptimizations: 0,
      totalContentChanges: 0,
      mostUsedActions: {} as Record<string, number>,
      averageOptimizationTime: 0,
      suggestionAcceptanceRate: 0
    };

    history.forEach((entry, index) => {
      if (entry.action === 'optimization_complete') {
        stats.totalOptimizations++;
      }

      if (entry.action === 'apply_suggestions') {
        stats.totalContentChanges += Math.abs(entry.after.content.length - entry.before.content.length);
      }

      stats.mostUsedActions[entry.action] = (stats.mostUsedActions[entry.action] || 0) + 1;

      if (entry.metadata?.performanceMetrics?.optimizationTime) {
        stats.averageOptimizationTime += entry.metadata.performanceMetrics.optimizationTime;
      }
    });

    if (stats.totalOptimizations > 0) {
      stats.averageOptimizationTime /= stats.totalOptimizations;
    }

    return stats;
  }, [history]);

  return {
    history,
    currentPosition,
    addHistoryEntry,
    undo,
    redo,
    getUndoRedoState,
    getHistoryPreview,
    revertToEntry,
    clearHistory,
    exportHistory,
    importHistory,
    getOptimizationStats
  };
}