
import React from 'react';
import { ContentTypeOptions } from './content-type/ContentTypeOptions';
import { ContentFormatOptions } from './content-type/ContentFormatOptions';
import { SolutionOptions } from './content-type/SolutionOptions';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export const ContentTypeStep = () => {
  const { 
    state,
    setContentType,
    setContentFormat,
    setSelectedSolution
  } = useContentBuilder();
  
  const { contentType, contentFormat, selectedSolution } = state;
  
  // Handle content type selection
  const handleContentTypeSelect = (value: string) => {
    setContentType(value as any); // Cast to ContentType
  };
  
  // Handle content format selection
  const handleFormatSelect = (value: string) => {
    setContentFormat(value as any); // Cast to ContentFormat
  };
  
  // Handle solution selection
  const handleSolutionSelect = (solution: any) => {
    setSelectedSolution(solution);
  };

  // Clear solution selection
  const handleClearSolution = () => {
    setSelectedSolution(null);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Content Type</h3>
        <p className="text-sm text-muted-foreground">
          Select the type of content you want to create
        </p>
      </div>
      
      {/* Content Type Selection */}
      <ContentTypeOptions 
        selectedContentType={contentType} 
        onContentTypeSelect={handleContentTypeSelect} 
      />
      
      {/* Content Format Selection */}
      {contentType && (
        <ContentFormatOptions 
          selectedContentFormat={contentFormat} 
          onFormatSelect={handleFormatSelect} 
        />
      )}
      
      {/* Solution Selection */}
      {contentType && contentFormat && (
        <SolutionOptions 
          selectedSolution={selectedSolution}
          onSolutionSelect={handleSolutionSelect}
          onClearSelection={handleClearSolution}
        />
      )}
    </div>
  );
};
