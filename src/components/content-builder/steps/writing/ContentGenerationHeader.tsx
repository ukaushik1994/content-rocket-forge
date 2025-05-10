
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, ListTree, Sparkles, Link, SquareMenu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AiProvider } from '@/services/aiService/types';
import { Card } from '@/components/ui/card';

interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  handleGenerateContent: () => void;
  handleToggleOutline: () => void;
  handleToggleInterlinking?: () => void;
  handleToggleGenerator: () => void;
  showOutline: boolean;
  showInterlinking?: boolean;
  outlineLength: number;
  aiProvider: AiProvider;
  onAiProviderChange: (provider: AiProvider) => void;
}

export const ContentGenerationHeader: React.FC<ContentGenerationHeaderProps> = ({
  isGenerating,
  handleGenerateContent,
  handleToggleOutline,
  handleToggleInterlinking,
  handleToggleGenerator,
  showOutline,
  showInterlinking,
  outlineLength,
  aiProvider,
  onAiProviderChange
}) => {
  return (
    <Card className="border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            className={`flex items-center gap-1.5 ${showOutline ? 'bg-secondary/50 text-secondary-foreground' : ''}`}
            onClick={handleToggleOutline}
          >
            <ListTree className="h-4 w-4" />
            {showOutline ? 'Hide Outline' : 'Show Outline'}
            {outlineLength > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {outlineLength}
              </Badge>
            )}
          </Button>

          {handleToggleInterlinking && (
            <Button 
              variant="outline" 
              size="sm" 
              className={`flex items-center gap-1.5 ${showInterlinking ? 'bg-secondary/50 text-secondary-foreground' : ''}`}
              onClick={handleToggleInterlinking}
            >
              <Link className="h-4 w-4" />
              {showInterlinking ? 'Hide Interlinking' : 'Show Interlinking'}
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1.5"
            onClick={handleToggleGenerator}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            Templates
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={aiProvider} onValueChange={(value: AiProvider) => onAiProviderChange(value)}>
            <SelectTrigger className="w-[160px] h-9 bg-white/5 border-white/10">
              <SelectValue placeholder="Select AI provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="gemini">Google Gemini</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleGenerateContent} 
            disabled={isGenerating}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple shadow-lg shadow-neon-purple/20"
          >
            <Wand2 className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Content'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
