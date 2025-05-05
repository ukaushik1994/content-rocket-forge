
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, PenLine, Sparkles, Loader2 } from 'lucide-react';

interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  handleGenerateContent: () => void;
  handleToggleOutline: () => void;
  handleToggleGenerator: () => void;
  showOutline: boolean;
  outlineLength: number;
  aiProvider: 'openai' | 'anthropic' | 'gemini';
  onAiProviderChange: (provider: 'openai' | 'anthropic' | 'gemini') => void;
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
    <Card className="border">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded">
              <PenLine className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Content Generator</h3>
              <p className="text-sm text-muted-foreground">
                Generate content using your outline and AI
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
            {/* AI Provider Selection */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">AI Provider:</span>
              <div className="flex items-center gap-1">
                {['openai', 'anthropic', 'gemini'].map((provider) => (
                  <button
                    key={provider}
                    className={`px-3 py-1 text-xs rounded-full ${
                      aiProvider === provider 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => onAiProviderChange(provider as 'openai' | 'anthropic' | 'gemini')}
                  >
                    {provider === 'openai' ? 'OpenAI' : 
                     provider === 'anthropic' ? 'Claude' : 'Gemini'}
                  </button>
                ))}
              </div>
            </div>
            
            <Button
              onClick={handleToggleOutline}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              {showOutline ? (
                <>
                  <EyeOff className="h-4 w-4" /> Hide Outline
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Show Outline
                </>
              )}
            </Button>
            
            <Button
              onClick={handleToggleGenerator}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <PenLine className="h-4 w-4" /> Templates
            </Button>
            
            <Button
              onClick={handleGenerateContent}
              disabled={outlineLength === 0 || isGenerating}
              size="sm"
              className="gap-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
