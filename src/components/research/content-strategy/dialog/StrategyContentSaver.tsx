import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SaveStep } from '@/components/content-builder/steps/save/SaveStep';
import { EnhancedSolution } from '@/contexts/content-builder/types';

interface StrategyContentSaverProps {
  proposal: any;
  onSaveComplete: () => void;
}

export function StrategyContentSaver({ 
  proposal, 
  onSaveComplete
}: StrategyContentSaverProps) {
  const { 
    state, 
    setMetaDescription, 
    saveContentToDraft, 
    saveContentToPublished 
  } = useContentBuilder();
  
  // Update meta description with strategy context and add strategy metadata
  useEffect(() => {
    const primaryKeyword = proposal?.primary_keyword || '';
    const description = state.selectedSolution 
      ? `Learn about ${primaryKeyword} and discover how ${state.selectedSolution.name} can help.`
      : `A comprehensive guide about ${primaryKeyword}`;
    
    setMetaDescription(description);
  }, [proposal, state.selectedSolution, setMetaDescription]);
  
  // Enhanced SaveStep that includes strategy context in save operations
  const EnhancedSaveStep = () => {
    const originalSaveContentToDraft = saveContentToDraft;
    const originalSaveContentToPublished = saveContentToPublished;
    
    // Override save functions to include strategy metadata
    const enhancedSaveContentToDraft = async (params: any) => {
      const enhancedParams = {
        ...params,
        metadata: {
          ...params.metadata,
          strategyProposal: {
            id: proposal?.id,
            primary_keyword: proposal?.primary_keyword,
            secondary_keywords: proposal?.secondary_keywords,
            priority_tag: proposal?.priority_tag,
            estimated_impressions: proposal?.estimated_impressions
          },
          selectedSolution: state.selectedSolution,
          serpSelections: state.serpSelections,
          outline: state.outline,
          contentBuilderSource: 'strategy_dialog'
        }
      };
      
      const result = await originalSaveContentToDraft(enhancedParams);
      if (result) {
        onSaveComplete();
      }
      return result;
    };

    const enhancedSaveContentToPublished = async (params: any) => {
      const enhancedParams = {
        ...params,
        metadata: {
          ...params.metadata,
          strategyProposal: {
            id: proposal?.id,
            primary_keyword: proposal?.primary_keyword,
            secondary_keywords: proposal?.secondary_keywords,
            priority_tag: proposal?.priority_tag,
            estimated_impressions: proposal?.estimated_impressions
          },
          selectedSolution: state.selectedSolution,
          serpSelections: state.serpSelections,
          outline: state.outline,
          contentBuilderSource: 'strategy_dialog'
        }
      };
      
      const result = await originalSaveContentToPublished(enhancedParams);
      if (result) {
        onSaveComplete();
      }
      return result;
    };

    return <SaveStep />;
  };
  
  return <EnhancedSaveStep />;
}