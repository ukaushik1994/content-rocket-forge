import { useState, useCallback } from 'react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

interface UseSimpleFormStateOptions {
  initialData?: Partial<EnhancedSolution>;
}

export const useSimpleFormState = (options: UseSimpleFormStateOptions = {}) => {
  const [formData, setFormData] = useState<Partial<EnhancedSolution>>(options.initialData || {});
  const [activeTab, setActiveTab] = useState('basic');
  const [isDirty, setIsDirty] = useState(false);

  const updateFormData = useCallback((updates: Partial<EnhancedSolution>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      console.log('Form data updated:', newData);
      return newData;
    });
    setIsDirty(true);
  }, []);

  const resetForm = useCallback((newData?: Partial<EnhancedSolution>) => {
    setFormData(newData || {});
    setIsDirty(false);
    setActiveTab('basic');
  }, []);

  const clearDirty = useCallback(() => {
    setIsDirty(false);
  }, []);

  return {
    formData,
    activeTab,
    isDirty,
    setActiveTab,
    updateFormData,
    resetForm,
    clearDirty
  };
};