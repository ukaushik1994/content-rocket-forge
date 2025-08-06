import { useState, useCallback, useRef, useEffect } from 'react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

export interface FormState {
  data: Partial<EnhancedSolution>;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  activeTab: string;
  lastSaved: Date | null;
}

export interface FormActions {
  updateField: (field: string, value: any) => void;
  updateData: (updates: Partial<EnhancedSolution>) => void;
  setActiveTab: (tab: string) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearErrors: () => void;
  resetForm: (initialData?: Partial<EnhancedSolution>) => void;
  markClean: () => void;
  getFormData: () => Partial<EnhancedSolution>;
}

interface FormPersistenceOptions {
  key: string;
  autoSaveInterval?: number;
  enablePersistence?: boolean;
}

/**
 * Advanced form state management with auto-save and persistence
 */
export function useSolutionFormState(options: FormPersistenceOptions): [FormState, FormActions] {
  const { key, autoSaveInterval = 10000, enablePersistence = true } = options;
  
  const [formState, setFormState] = useState<FormState>({
    data: {},
    isDirty: false,
    isValid: true,
    errors: {},
    activeTab: 'basic',
    lastSaved: null
  });

  const autoSaveTimer = useRef<NodeJS.Timeout>();
  const persistenceKey = `solution_form_${key}`;

  // Load persisted data on mount
  useEffect(() => {
    if (!enablePersistence) return;

    try {
      const saved = localStorage.getItem(persistenceKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const lastSaved = parsed.lastSaved ? new Date(parsed.lastSaved) : null;
        
        // Only restore if saved within the last 24 hours
        if (lastSaved && Date.now() - lastSaved.getTime() < 24 * 60 * 60 * 1000) {
          setFormState(prev => ({
            ...prev,
            data: parsed.data || {},
            activeTab: parsed.activeTab || 'basic',
            lastSaved
          }));
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted form data:', error);
    }
  }, [persistenceKey, enablePersistence]);

  // Auto-save functionality
  useEffect(() => {
    if (!enablePersistence || !formState.isDirty) return;

    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Set new timer
    autoSaveTimer.current = setTimeout(() => {
      try {
        const dataToSave = {
          data: formState.data,
          activeTab: formState.activeTab,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(persistenceKey, JSON.stringify(dataToSave));
        
        setFormState(prev => ({
          ...prev,
          lastSaved: new Date()
        }));
      } catch (error) {
        console.warn('Failed to auto-save form data:', error);
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [formState.isDirty, formState.data, formState.activeTab, autoSaveInterval, persistenceKey, enablePersistence]);

  const updateField = useCallback((field: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
      errors: { ...prev.errors, [field]: '' } // Clear field error when updating
    }));
  }, []);

  const updateData = useCallback((updates: Partial<EnhancedSolution>) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates },
      isDirty: true
    }));
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setFormState(prev => ({
      ...prev,
      activeTab: tab
    }));
  }, []);

  const setError = useCallback((field: string, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setFormState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, []);

  const clearErrors = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      errors: {},
      isValid: true
    }));
  }, []);

  const resetForm = useCallback((initialData?: Partial<EnhancedSolution>) => {
    setFormState({
      data: initialData || {},
      isDirty: false,
      isValid: true,
      errors: {},
      activeTab: 'basic',
      lastSaved: null
    });

    // Clear persisted data
    if (enablePersistence) {
      try {
        localStorage.removeItem(persistenceKey);
      } catch (error) {
        console.warn('Failed to clear persisted form data:', error);
      }
    }
  }, [persistenceKey, enablePersistence]);

  const markClean = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      isDirty: false,
      lastSaved: new Date()
    }));

    // Clear persisted data since it's now saved
    if (enablePersistence) {
      try {
        localStorage.removeItem(persistenceKey);
      } catch (error) {
        console.warn('Failed to clear persisted form data:', error);
      }
    }
  }, [persistenceKey, enablePersistence]);

  const getFormData = useCallback(() => {
    return formState.data;
  }, [formState.data]);

  const actions: FormActions = {
    updateField,
    updateData,
    setActiveTab,
    setError,
    clearError,
    clearErrors,
    resetForm,
    markClean,
    getFormData
  };

  return [formState, actions];
}