
import { useState, useCallback, useMemo } from 'react';
import { StandardizedFAQ, createFAQContentId } from '@/utils/faqDataUtils';

export interface FAQSelectionState {
  selectedFAQs: Map<string, StandardizedFAQ>;
  toggleFAQSelection: (faq: StandardizedFAQ) => void;
  isFAQSelected: (faq: StandardizedFAQ) => boolean;
  clearSelections: () => void;
  getSelectedCount: () => number;
  getSelectedFAQs: () => StandardizedFAQ[];
}

/**
 * Custom hook for managing FAQ selection state with proper data handling
 */
export const useFAQSelection = (initialSelections?: StandardizedFAQ[]): FAQSelectionState => {
  const [selectedFAQs, setSelectedFAQs] = useState<Map<string, StandardizedFAQ>>(() => {
    const initialMap = new Map<string, StandardizedFAQ>();
    if (initialSelections) {
      initialSelections.forEach(faq => {
        const id = createFAQContentId(faq);
        initialMap.set(id, faq);
      });
    }
    return initialMap;
  });

  const toggleFAQSelection = useCallback((faq: StandardizedFAQ) => {
    const id = createFAQContentId(faq);
    
    setSelectedFAQs(prev => {
      const newMap = new Map(prev);
      
      if (newMap.has(id)) {
        newMap.delete(id);
      } else {
        newMap.set(id, faq);
      }
      
      return newMap;
    });
  }, []);

  const isFAQSelected = useCallback((faq: StandardizedFAQ): boolean => {
    const id = createFAQContentId(faq);
    return selectedFAQs.has(id);
  }, [selectedFAQs]);

  const clearSelections = useCallback(() => {
    setSelectedFAQs(new Map());
  }, []);

  const getSelectedCount = useCallback((): number => {
    return selectedFAQs.size;
  }, [selectedFAQs]);

  const getSelectedFAQs = useCallback((): StandardizedFAQ[] => {
    return Array.from(selectedFAQs.values());
  }, [selectedFAQs]);

  return useMemo(() => ({
    selectedFAQs,
    toggleFAQSelection,
    isFAQSelected,
    clearSelections,
    getSelectedCount,
    getSelectedFAQs
  }), [selectedFAQs, toggleFAQSelection, isFAQSelected, clearSelections, getSelectedCount, getSelectedFAQs]);
};
