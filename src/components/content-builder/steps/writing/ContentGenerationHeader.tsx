
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';

interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  handleGenerateContent: () => void;
  handleToggleOutline: () => void;
  handleToggleGenerator: () => void;
  showOutline: boolean;
  outlineLength: number;
}

export const ContentGenerationHeader: React.FC<ContentGenerationHeaderProps> = ({
  isGenerating,
  handleGenerateContent,
  handleToggleOutline,
  handleToggleGenerator,
  showOutline,
  outlineLength
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-medium">Write Your Content</h3>
        <p className="text-sm text-muted-foreground">
          Create your content based on the generated outline.
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleToggleOutline}
        >
          {showOutline ? 'Hide Sidebar' : 'Show Sidebar'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleToggleGenerator}
        >
          <Plus className="h-4 w-4 mr-2" />
          Content Templates
        </Button>
        
        <Button
          onClick={handleGenerateContent}
          disabled={isGenerating || outlineLength === 0}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-1" />
              Generate Content
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
