
import React from 'react';
import { ContentTypeOptions } from './content-type/ContentTypeOptions';
import { ContentFormatOptions } from './content-type/ContentFormatOptions';
import { SolutionOptions } from './content-type/SolutionOptions';
import { useContentTypeSelection } from './content-type/hooks/useContentTypeSelection';

export const ContentTypeStep = () => {
  const {
    contentType,
    contentFormat,
    selectedSolution,
    handleContentTypeSelect,
    handleFormatSelect,
    handleSolutionSelect,
    handleClearSolution
  } = useContentTypeSelection();
  
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
