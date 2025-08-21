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
  const { state, setMetaDescription } = useContentBuilder();
  
  // Update meta description with strategy context
  useEffect(() => {
    const primaryKeyword = proposal?.primary_keyword || '';
    const description = state.selectedSolution 
      ? `Learn about ${primaryKeyword} and discover how ${state.selectedSolution.name} can help.`
      : `A comprehensive guide about ${primaryKeyword}`;
    
    setMetaDescription(description);
  }, [proposal, state.selectedSolution, setMetaDescription]);
  
  return <SaveStep />;
}