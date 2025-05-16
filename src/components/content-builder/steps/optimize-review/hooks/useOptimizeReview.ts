
import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useFinalReview } from '@/hooks/useFinalReview';
import { useSaveContent } from '@/hooks/final-review/useSaveContent';
import { useChecklistItems } from '../../../final-review/hooks/useChecklistItems';
import { toast } from 'sonner';

export function useOptimizeReview() {
  const [activeTab, setActiveTab] = useState('overview');
  const { state, dispatch } = useContentBuilder();
  
  const {
    isAnalyzing,
    isGeneratingTitles,
    isRunningAllChecks,
    keywordUsage,
    ctaInfo,
    titleSuggestions,
    serpData,
    generateMeta,
    generateTitleSuggestions,
    analyzeSolutionUsage,
    runAllChecks
  } = useFinalReview();
  
  const { handleSaveToDraft, handlePublish, isSaving, isSavedToDraft } = useSaveContent();
  const { checklistItems, passedChecks, totalChecks, completionPercentage } = useChecklistItems();
  
  // Handler for running checks specific to the current tab
  const handleRunTabChecks = () => {
    switch(activeTab) {
      case 'overview':
        runAllChecks();
        break;
      case 'optimize':
        analyzeSolutionUsage();
        break;
      case 'seo':
        analyzeSolutionUsage();
        break;
      case 'technical':
        generateTitleSuggestions();
        break;
      default:
        runAllChecks();
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const onMetaTitleChange = (value: string) => {
    dispatch({ type: 'SET_META_TITLE', payload: value });
  };
  
  const onMetaDescriptionChange = (value: string) => {
    dispatch({ type: 'SET_META_DESCRIPTION', payload: value });
  };
  
  // Wrapper functions to convert Promise<string | null> to Promise<void>
  const handleSaveToDraftWrapper = async () => {
    try {
      await handleSaveToDraft();
      // Don't need to return anything for void
    } catch (error) {
      console.error("Error saving to draft:", error);
      toast.error("Failed to save to draft");
    }
  };
  
  const handlePublishWrapper = async () => {
    try {
      await handlePublish();
      // Don't need to return anything for void
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error("Failed to publish content");
    }
  };
  
  return {
    activeTab,
    setActiveTab,
    handleTabChange,
    state,
    isAnalyzing,
    isGeneratingTitles,
    isRunningAllChecks,
    keywordUsage,
    ctaInfo,
    titleSuggestions,
    serpData,
    generateMeta,
    generateTitleSuggestions,
    analyzeSolutionUsage,
    runAllChecks,
    handleRunTabChecks,
    onMetaTitleChange,
    onMetaDescriptionChange,
    handleSaveToDraftWrapper,
    handlePublishWrapper,
    isSaving,
    isSavedToDraft,
    checklistItems,
    passedChecks,
    totalChecks,
    completionPercentage
  };
}
