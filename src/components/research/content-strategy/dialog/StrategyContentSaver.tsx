import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SaveStep } from '@/components/content-builder/steps/save/SaveStep';

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
  
  // Update meta description with strategy context when component mounts
  useEffect(() => {
    const primaryKeyword = proposal?.primary_keyword || '';
    const description = state.selectedSolution 
      ? `Learn about ${primaryKeyword} and discover how ${state.selectedSolution.name} can help.`
      : `A comprehensive guide about ${primaryKeyword}`;
    
    setMetaDescription(description);
  }, [proposal, state.selectedSolution, setMetaDescription]);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Save Your Content</h3>
        <p className="text-muted-foreground">
          Your strategy content for "{proposal?.primary_keyword}" is ready to save
        </p>
      </div>
      
      <SaveStep />
    </div>
  );
}