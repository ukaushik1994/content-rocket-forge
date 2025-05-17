
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface ContentGenerationHeaderProps {
  mainKeyword: string;
  isGenerating: boolean;
  onSave: () => void;
}

export const ContentGenerationHeader: React.FC<ContentGenerationHeaderProps> = ({
  mainKeyword,
  isGenerating,
  onSave
}) => {
  return (
    <div className="bg-card border-b p-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-medium">Writing content for: <span className="text-primary">{mainKeyword}</span></h2>
        <p className="text-muted-foreground text-sm">
          {isGenerating ? "Generating content..." : "Select a template or edit your content"}
        </p>
      </div>
      <div>
        {!isGenerating && (
          <Button onClick={onSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Content
          </Button>
        )}
      </div>
    </div>
  );
};
