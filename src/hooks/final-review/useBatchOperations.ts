import { useState } from 'react';
import { ContentSyncService } from '@/services/contentSyncService';
import { EnhancedSuggestion } from '@/services/contentHighlightService';
import { toast } from 'sonner';

export const useBatchOperations = () => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [isApplyingBatch, setIsApplyingBatch] = useState(false);

  const toggleSuggestionSelection = (suggestionId: string) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suggestionId)) {
        newSet.delete(suggestionId);
      } else {
        newSet.add(suggestionId);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedSuggestions(new Set());
  };

  const applySelectedSuggestions = async (
    content: string,
    suggestions: EnhancedSuggestion[],
    updateContentCallback: (newContent: string) => void
  ) => {
    if (selectedSuggestions.size === 0) {
      toast.error('No suggestions selected');
      return;
    }

    setIsApplyingBatch(true);
    try {
      const suggestionData = Array.from(selectedSuggestions).map(suggestionId => {
        const suggestion = suggestions.find(s => s.id === suggestionId);
        if (!suggestion || !suggestion.replacements[0]) {
          throw new Error(`Invalid suggestion: ${suggestionId}`);
        }
        return {
          suggestionId,
          replacement: suggestion.replacements[0]
        };
      });

      const appliedCount = await ContentSyncService.applyMultipleSuggestions(
        content,
        suggestionData,
        updateContentCallback
      );

      if (appliedCount > 0) {
        clearSelection();
        toast.success(`Successfully applied ${appliedCount} suggestions`);
      }
    } catch (error: any) {
      toast.error('Failed to apply batch suggestions: ' + error.message);
    } finally {
      setIsApplyingBatch(false);
    }
  };

  return {
    selectedSuggestions,
    isApplyingBatch,
    toggleSuggestionSelection,
    clearSelection,
    applySelectedSuggestions
  };
};

export default useBatchOperations;