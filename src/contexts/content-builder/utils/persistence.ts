/**
 * State persistence utilities for Content Builder
 */

import { ContentBuilderState } from '../types/state-types';

const STORAGE_KEY = 'content-builder-state';
const AUTO_SAVE_DEBOUNCE = 1000; // 1 second

/**
 * Saves state to localStorage with error handling
 */
export const saveStateToStorage = (state: ContentBuilderState): boolean => {
  try {
    const serializedState = JSON.stringify({
      ...state,
      // Don't persist loading states
      isAnalyzing: false,
      isGenerating: false,
      isSaving: false,
      // Add timestamp for recovery
      lastSaved: Date.now()
    });
    
    localStorage.setItem(STORAGE_KEY, serializedState);
    return true;
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
    return false;
  }
};

/**
 * Loads state from localStorage with error handling
 */
export const loadStateFromStorage = (): Partial<ContentBuilderState> | null => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) return null;

    const parsedState = JSON.parse(savedState);
    
    // Validate that the saved state has a reasonable structure
    if (!parsedState || typeof parsedState !== 'object') {
      return null;
    }

    // Clean up any temporary states
    delete parsedState.isAnalyzing;
    delete parsedState.isGenerating;
    delete parsedState.isSaving;

    return parsedState;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
};

/**
 * Clears saved state from localStorage
 */
export const clearSavedState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear saved state:', error);
  }
};

/**
 * Checks if there's a saved state available
 */
export const hasSavedState = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Gets the last saved timestamp
 */
export const getLastSavedTime = (): number | null => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) return null;

    const parsedState = JSON.parse(savedState);
    return parsedState.lastSaved || null;
  } catch (error) {
    return null;
  }
};

/**
 * Debounced auto-save function
 */
let autoSaveTimeout: NodeJS.Timeout | null = null;

export const autoSaveState = (state: ContentBuilderState): void => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  autoSaveTimeout = setTimeout(() => {
    saveStateToStorage(state);
  }, AUTO_SAVE_DEBOUNCE);
};

/**
 * Creates a backup of the current state
 */
export const createBackup = (state: ContentBuilderState, label?: string): boolean => {
  try {
    const backupKey = `${STORAGE_KEY}-backup-${Date.now()}`;
    const backupData = {
      state,
      label: label || 'Auto Backup',
      timestamp: Date.now()
    };
    
    localStorage.setItem(backupKey, JSON.stringify(backupData));
    
    // Keep only the last 5 backups
    const allKeys = Object.keys(localStorage);
    const backupKeys = allKeys.filter(key => key.startsWith(`${STORAGE_KEY}-backup-`));
    
    if (backupKeys.length > 5) {
      backupKeys.sort();
      const keysToRemove = backupKeys.slice(0, backupKeys.length - 5);
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to create backup:', error);
    return false;
  }
};

/**
 * Lists available backups
 */
export const listBackups = (): Array<{
  key: string;
  label: string;
  timestamp: number;
}> => {
  try {
    const allKeys = Object.keys(localStorage);
    const backupKeys = allKeys.filter(key => key.startsWith(`${STORAGE_KEY}-backup-`));
    
    return backupKeys.map(key => {
      try {
        const backupData = JSON.parse(localStorage.getItem(key) || '{}');
        return {
          key,
          label: backupData.label || 'Backup',
          timestamp: backupData.timestamp || 0
        };
      } catch {
        return {
          key,
          label: 'Corrupted Backup',
          timestamp: 0
        };
      }
    }).sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
};
