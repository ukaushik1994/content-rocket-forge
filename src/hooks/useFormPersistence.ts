import { useState, useEffect, useCallback } from 'react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

interface FormPersistenceOptions {
  key: string;
  autoSaveInterval?: number;
}

export const useFormPersistence = (options: FormPersistenceOptions) => {
  const { key, autoSaveInterval = 10000 } = options; // 10 seconds default for better UX
  
  const [formData, setFormData] = useState<Partial<EnhancedSolution>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`form-${key}`);
    const savedTab = localStorage.getItem(`form-tab-${key}`);
    const savedTimestamp = localStorage.getItem(`form-timestamp-${key}`);
    
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setFormData(parsedData);
        setIsDirty(true);
        if (savedTimestamp) {
          setLastSaved(new Date(savedTimestamp));
        }
      } catch (error) {
        console.error('Failed to parse saved form data:', error);
        // Clear corrupted data
        localStorage.removeItem(`form-${key}`);
        localStorage.removeItem(`form-tab-${key}`);
        localStorage.removeItem(`form-timestamp-${key}`);
      }
    }
    
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [key]);
  
  // Auto-save to localStorage with timestamp
  useEffect(() => {
    if (!isDirty) return;
    
    const interval = setInterval(() => {
      if (Object.keys(formData).length > 0) {
        const timestamp = new Date().toISOString();
        localStorage.setItem(`form-${key}`, JSON.stringify(formData));
        localStorage.setItem(`form-tab-${key}`, activeTab);
        localStorage.setItem(`form-timestamp-${key}`, timestamp);
        setLastSaved(new Date(timestamp));
      }
    }, autoSaveInterval);
    
    return () => clearInterval(interval);
  }, [formData, activeTab, isDirty, key, autoSaveInterval]);
  
  const updateFormData = useCallback((updates: Partial<EnhancedSolution>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);
  
  const clearPersistedData = useCallback(() => {
    localStorage.removeItem(`form-${key}`);
    localStorage.removeItem(`form-tab-${key}`);
    localStorage.removeItem(`form-timestamp-${key}`);
    setIsDirty(false);
    setLastSaved(null);
  }, [key]);
  
  const initializeFormData = useCallback((initialData: Partial<EnhancedSolution>) => {
    // Check if we have persisted data that's newer than initial data
    const saved = localStorage.getItem(`form-${key}`);
    const savedTimestamp = localStorage.getItem(`form-timestamp-${key}`);
    
    if (saved && savedTimestamp) {
      try {
        const parsedData = JSON.parse(saved);
        const savedTime = new Date(savedTimestamp);
        
        // If we have recent saved data (less than 1 hour old), use it instead
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (savedTime > oneHourAgo && Object.keys(parsedData).length > 0) {
          setFormData(parsedData);
          setIsDirty(true);
          setLastSaved(savedTime);
          return;
        }
      } catch (error) {
        console.error('Failed to parse saved form data during initialization:', error);
      }
    }
    
    // Use initial data if no recent saved data
    setFormData(initialData);
    setIsDirty(false);
    setLastSaved(null);
  }, [key]);
  
  return {
    formData,
    activeTab,
    isDirty,
    lastSaved,
    setActiveTab,
    updateFormData,
    clearPersistedData,
    initializeFormData
  };
};