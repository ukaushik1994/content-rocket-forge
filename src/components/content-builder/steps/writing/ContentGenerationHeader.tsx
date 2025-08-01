
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { TitleGenerationButton } from './TitleGenerationButton';
import { 
  Sparkles, 
  ListTodo, 
  CheckSquare,  
  Save,
  Bot, 
  UserRound, 
  Hash
} from 'lucide-react';
import { AiProvider } from '@/services/aiService/types';
import { formatDistanceToNow } from 'date-fns';

interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  handleGenerateContent: () => void;
  handleToggleOutline: () => void;
  showOutline: boolean;
  outlineLength: number;
  aiProvider: AiProvider;
  onAiProviderChange: (provider: AiProvider) => void;
  autoSaveTimestamp?: string | null;
  hasUnsavedChanges?: boolean;
  onManualSave?: () => void;
  wordCountLimit?: number;
  onWordCountChange?: (count: number) => void;
  onGenerateTitle?: () => void;
}

export const ContentGenerationHeader: React.FC<ContentGenerationHeaderProps> = ({
  isGenerating,
  handleGenerateContent,
  handleToggleOutline,
  showOutline,
  outlineLength,
  aiProvider,
  onAiProviderChange,
  autoSaveTimestamp,
  hasUnsavedChanges,
  onManualSave,
  wordCountLimit,
  onWordCountChange,
  onGenerateTitle
}) => {
  const [wordCountInput, setWordCountInput] = useState(wordCountLimit?.toString() || '1500');
  
  const handleWordCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(wordCountInput);
    if (!isNaN(count) && count > 0 && onWordCountChange) {
      onWordCountChange(count);
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            onClick={handleGenerateContent}
            disabled={isGenerating || outlineLength === 0}
            className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg"
            size="lg"
          >
            {isGenerating ? (
              <><Sparkles className="mr-2 h-4 w-4 animate-pulse" /> Generating...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Generate Content{wordCountLimit ? ` (${wordCountLimit} words)` : ''}</>
            )}
          </Button>
          
          <Toggle
            variant="outline"
            pressed={showOutline}
            onPressedChange={handleToggleOutline}
            aria-label="Toggle outline"
            className="data-[state=on]:bg-primary/10 data-[state=on]:text-primary border-border hover:bg-muted"
          >
            <ListTodo className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Outline</span>
          </Toggle>
          
          <TitleGenerationButton />
          
          <form onSubmit={handleWordCountSubmit} className="flex items-center gap-2 bg-background/50 border border-border rounded-lg p-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <Input 
              type="number"
              value={wordCountInput}
              onChange={(e) => setWordCountInput(e.target.value)}
              className="w-20 h-8 text-sm bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:ring-offset-0"
              placeholder="1500"
              min="100"
            />
            <Button 
              type="submit" 
              size="sm" 
              variant="secondary" 
              className="h-8 px-3 text-sm"
            >
              Set
            </Button>
          </form>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Auto-save indicator */}
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {hasUnsavedChanges ? (
              <div className="flex items-center gap-2 text-amber-600">
                <span className="inline-block h-2 w-2 bg-amber-400 rounded-full animate-pulse"></span>
                <span>Unsaved changes</span>
              </div>
            ) : autoSaveTimestamp ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckSquare className="h-4 w-4" />
                <span>Auto-saved {formatDistanceToNow(new Date(autoSaveTimestamp), { addSuffix: true })}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
