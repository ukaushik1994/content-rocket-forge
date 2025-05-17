
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { ContentType } from '@/contexts/content-builder/types/content-types';

interface ContentInstructionsProps {
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  mainKeyword: string;
  contentType: ContentType;
  selectedSerpItems: number;
}

export const ContentInstructions: React.FC<ContentInstructionsProps> = ({
  customPrompt,
  setCustomPrompt,
  mainKeyword,
  contentType,
  selectedSerpItems
}) => {
  // Create a prompt suggestion based on SERP data and content type
  const promptSuggestion = `Write a comprehensive ${contentType || 'article'} about "${mainKeyword}" that addresses the following key points:

1. Start with a clear introduction that establishes the topic's importance
2. Cover the main aspects thoroughly with clear headings and subheadings
3. Include relevant facts, statistics, and examples
4. Address common questions and objections
5. Provide actionable takeaways and next steps
6. Optimize for SEO while maintaining natural, engaging writing style
7. Use a conversational yet authoritative tone`;

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomPrompt(e.target.value);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Custom Instructions</h3>
        {selectedSerpItems > 0 && (
          <span className="text-xs text-primary">Using {selectedSerpItems} selected SERP items</span>
        )}
      </div>
      
      {selectedSerpItems === 0 && (
        <Alert variant="warning" className="bg-amber-950/20 border-amber-500/30 text-amber-200">
          <Info className="h-4 w-4" />
          <AlertTitle>No SERP items selected</AlertTitle>
          <AlertDescription className="text-xs">
            For best results, select relevant items from the SERP analysis step before generating content.
          </AlertDescription>
        </Alert>
      )}
      
      <Textarea
        placeholder={promptSuggestion}
        className="min-h-[150px] bg-white/5 border-white/10"
        value={customPrompt || ''}
        onChange={handlePromptChange}
      />
    </div>
  );
};
