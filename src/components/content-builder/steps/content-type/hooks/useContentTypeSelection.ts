
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ContentType, ContentFormat } from '@/contexts/content-builder/types';
import { Solution } from '@/contexts/content-builder/types/solution-types';

export const useContentTypeSelection = () => {
  const { state, setContentType, setContentFormat, setSelectedSolution } = useContentBuilder();
  const { contentType, contentFormat } = state;
  
  const [selectedSolution, setLocalSelectedSolution] = useState<Solution | null>(null);
  
  // Mark step as completed when contentType is selected
  useEffect(() => {
    if (contentType) {
      console.log("ContentType selected:", contentType);
    }
  }, [contentType]);
  
  // Handle content type selection
  const handleContentTypeSelect = (value: string) => {
    // Cast the string value to ContentType
    setContentType(value as ContentType);
  };
  
  // Handle content format selection
  const handleFormatSelect = (value: string) => {
    // Cast the string value to ContentFormat
    setContentFormat(value as ContentFormat);
  };
  
  // Handle solution selection
  const handleSolutionSelect = (solution: Solution) => {
    setLocalSelectedSolution(solution);
    setSelectedSolution(solution);
  };

  // Clear solution selection
  const handleClearSolution = () => {
    setLocalSelectedSolution(null);
    setSelectedSolution(null);
  };
  
  return {
    contentType,
    contentFormat,
    selectedSolution: selectedSolution,
    handleContentTypeSelect,
    handleFormatSelect,
    handleSolutionSelect,
    handleClearSolution
  };
};
