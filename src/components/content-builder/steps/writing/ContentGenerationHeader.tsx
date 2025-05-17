
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AiProvider } from '@/services/aiService/types';
import { AiProviderSelector } from './AiProviderSelector';

export interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  handleGenerateContent: () => Promise<void>;
  handleToggleOutline: () => void;
  handleToggleGenerator: () => void;
  showOutline: boolean;
  outlineLength: number;
  aiProvider: AiProvider;
  onAiProviderChange: (provider: AiProvider) => void;
}

export const ContentGenerationHeader: React.FC<ContentGenerationHeaderProps> = ({
  isGenerating,
  handleGenerateContent,
  handleToggleOutline,
  handleToggleGenerator,
  showOutline,
  outlineLength,
  aiProvider,
  onAiProviderChange
}) => {
  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5"
            onClick={handleToggleOutline}
          >
            {showOutline ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" /> Hide Outline
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" /> Show Outline {outlineLength > 0 && `(${outlineLength})`}
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5"
            onClick={handleToggleGenerator}
          >
            {showOutline ? (
              <>AI Generator</>
            ) : (
              <>Show Generator</>
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <AiProviderSelector 
            selectedProvider={aiProvider}
            onChange={onAiProviderChange}
          />
          
          <Button
            onClick={handleGenerateContent}
            disabled={isGenerating}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" /> Generate Content
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
