
import React, { ChangeEvent } from 'react';

interface ContentSidebarProps {
  outline: any[];
  selectedSolution: any;
  additionalInstructions: string;
  handleInstructionsChange: (value: string) => void;
}

export const ContentSidebar: React.FC<ContentSidebarProps> = ({
  outline,
  selectedSolution,
  additionalInstructions,
  handleInstructionsChange
}) => {
  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleInstructionsChange(e.target.value);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Outline Display */}
      <div className="bg-card p-4 rounded-lg border shadow-sm space-y-2 flex-1">
        <h3 className="font-medium text-sm flex items-center justify-between">
          <span>Content Outline</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{outline.length} sections</span>
        </h3>
        
        <ul className="space-y-2 text-sm mt-2">
          {outline.map((item, index) => (
            <li key={index} className="border-l-2 border-primary/40 pl-3 py-1">
              {typeof item === 'string' ? item : item.title}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Additional Instructions */}
      <div className="bg-card p-4 rounded-lg border shadow-sm space-y-2">
        <h3 className="font-medium text-sm">Additional Instructions</h3>
        <textarea 
          className="w-full h-32 bg-background border rounded-md p-3 text-sm resize-none"
          placeholder="Add any specific instructions for the content..."
          value={additionalInstructions}
          onChange={handleTextAreaChange}
        />
      </div>
      
      {/* Selected Solution Info */}
      {selectedSolution && (
        <div className="bg-card p-4 rounded-lg border shadow-sm space-y-2">
          <h3 className="font-medium text-sm">Selected Solution</h3>
          <div className="text-sm">
            <p className="font-medium">{selectedSolution.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{selectedSolution.description}</p>
            
            {selectedSolution.features && selectedSolution.features.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium">Key Features:</p>
                <ul className="list-disc pl-4 text-xs text-muted-foreground">
                  {selectedSolution.features.slice(0, 3).map((feature: string, idx: number) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
