
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Clipboard, EyeOff, Eye } from "lucide-react";
import { AiProviderSelector } from "@/components/content-builder/outline/ai-generator/AiProviderSelector";
import { AiProvider } from '@/services/aiService/types';

interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  handleGenerateContent: () => void;
  handleToggleOutline: () => void;
  handleToggleGenerator: () => void;
  showOutline: boolean;
  outlineLength: number;
  aiProvider: AiProvider;
  onAiProviderChange: (provider: AiProvider) => void;
}

export function ContentGenerationHeader({
  isGenerating,
  handleGenerateContent,
  handleToggleOutline,
  handleToggleGenerator,
  showOutline,
  outlineLength,
  aiProvider,
  onAiProviderChange
}: ContentGenerationHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all"
          onClick={handleGenerateContent}
          disabled={isGenerating}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="bg-glass border border-white/10 hover:border-white/20"
          onClick={handleToggleGenerator}
        >
          <Clipboard className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <AiProviderSelector 
          aiProvider={aiProvider}
          setAiProvider={onAiProviderChange}
        />
        
        <Button
          size="sm"
          variant="outline"
          className="bg-glass border border-white/10 hover:border-white/20"
          onClick={handleToggleOutline}
        >
          {showOutline ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Outline
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show Outline ({outlineLength})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
