import { useState, useEffect, useCallback } from 'react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

interface FormPersistenceOptions {
  key: string;
  autoSaveInterval?: number;
}

export const useFormPersistence = (options: FormPersistenceOptions) => {
  const { key, autoSaveInterval = 30000 } = options; // 30 seconds default
  
  const [formData, setFormData] = useState<Partial<EnhancedSolution>>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [isDirty, setIsDirty] = useState(false);
  
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`form-${key}`);
    const savedTab = localStorage.getItem(`form-tab-${key}`);
    
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setFormData(parsedData);
        setIsDirty(true);
      } catch (error) {
        console.error('Failed to parse saved form data:', error);
      }
    }
    
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [key]);
  
  // Auto-save to localStorage
  useEffect(() => {
    if (!isDirty) return;
    
    const interval = setInterval(() => {
      if (Object.keys(formData).length > 0) {
        localStorage.setItem(`form-${key}`, JSON.stringify(formData));
        localStorage.setItem(`form-tab-${key}`, activeTab);
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
    setIsDirty(false);
  }, [key]);
  
  const initializeFormData = useCallback((initialData: Partial<EnhancedSolution>) => {
    setFormData(initialData);
    setIsDirty(false);
  }, []);
  
  return {
    formData,
    activeTab,
    isDirty,
    setActiveTab,
    updateFormData,
    clearPersistedData,
    initializeFormData
  };
};