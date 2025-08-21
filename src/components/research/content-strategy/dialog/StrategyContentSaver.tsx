import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SaveStep } from '@/components/content-builder/steps/save/SaveStep';
import { EnhancedSolution } from '@/contexts/content-builder/types';

interface StrategyContentSaverProps {
  proposal: any;
  selectedSolution: EnhancedSolution | null;
  outline: string[];
  content: string;
  title: string;
  onSaveComplete: () => void;
}

export function StrategyContentSaver({ 
  proposal, 
  selectedSolution, 
  outline,
  content,
  title,
  onSaveComplete
}: StrategyContentSaverProps) {
  const { setContent, setContentTitle, setMetaTitle, setMetaDescription } = useContentBuilder();
  
  // Initialize content builder context with the strategy data
  useEffect(() => {
    if (content) {
      setContent(content);
    }
    if (title) {
      setContentTitle(title);
      setMetaTitle(title);
    }
    
    // Set meta description based on proposal and solution
    const primaryKeyword = proposal?.primary_keyword || '';
    const description = selectedSolution 
      ? `Learn about ${primaryKeyword} and discover how ${selectedSolution.name} can help.`
      : `A comprehensive guide about ${primaryKeyword}`;
    
    setMetaDescription(description);
  }, [content, title, proposal, selectedSolution, setContent, setContentTitle, setMetaTitle, setMetaDescription]);
  
  return <SaveStep />;
}