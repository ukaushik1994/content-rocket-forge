
import React from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { 
  Sparkles, 
  ListTodo, 
  CheckSquare, 
  PenSquare, 
  Cog, 
  Bot, 
  UserRound, 
  Wand2,
  Save
} from 'lucide-react';
import { AiProvider } from '@/services/aiService/types';
import { formatDistanceToNow } from 'date-fns';

interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  handleGenerateContent: () => void;
  handleToggleOutline: () => void;
  handleToggleGenerator: () => void;
  showOutline: boolean;
  outlineLength: number;
  aiProvider: AiProvider;
  onAiProviderChange: (provider: AiProvider) => void;
  autoSaveTimestamp?: string | null;
  hasUnsavedChanges?: boolean;
  onManualSave?: () => void;
}

export const ContentGenerationHeader: React.FC<ContentGenerationHeaderProps> = ({
  isGenerating,
  handleGenerateContent,
  handleToggleOutline,
  handleToggleGenerator,
  showOutline,
  outlineLength,
  aiProvider,
  onAiProviderChange,
  autoSaveTimestamp,
  hasUnsavedChanges,
  onManualSave
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          onClick={handleGenerateContent}
          disabled={isGenerating || outlineLength === 0}
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white"
        >
          {isGenerating ? (
            <><Sparkles className="mr-2 h-4 w-4 animate-pulse" /> Generating...</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> Generate Content</>
          )}
        </Button>
        
        <div className="flex gap-1 ml-2">
          <Toggle
            variant="outline"
            pressed={showOutline}
            onPressedChange={handleToggleOutline}
            aria-label="Toggle outline"
            className="bg-slate-900/30 data-[state=on]:bg-slate-800/70 border border-white/10 hover:bg-slate-800/50"
          >
            <ListTodo className="h-4 w-4" />
          </Toggle>
          
          <Toggle
            variant="outline"
            onPressedChange={handleToggleGenerator}
            aria-label="Toggle content generator"
            className="bg-slate-900/30 data-[state=on]:bg-slate-800/70 border border-white/10 hover:bg-slate-800/50"
          >
            <Wand2 className="h-4 w-4" />
          </Toggle>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Auto-save indicator */}
        <div className="text-xs text-white/50 flex items-center gap-1">
          {hasUnsavedChanges ? (
            <>
              <span className="inline-block h-2 w-2 bg-amber-400 rounded-full animate-pulse"></span>
              Unsaved changes
            </>
          ) : autoSaveTimestamp ? (
            <>
              <CheckSquare className="h-3 w-3 text-green-400" />
              Saved {formatDistanceToNow(new Date(autoSaveTimestamp), { addSuffix: true })}
            </>
          ) : null}
        </div>
        
        {/* Manual save button */}
        {onManualSave && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onManualSave}
            disabled={!hasUnsavedChanges}
            className="text-xs bg-white/5 border-white/10 hover:bg-white/10"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
        )}
        
        {/* AI Provider selector */}
        <div className="flex items-center gap-1 border border-white/10 p-1 rounded-md bg-slate-900/30">
          <Button
            variant="ghost"
            size="sm"
            className={`text-xs px-2 ${aiProvider === 'openai' ? 'bg-white/10' : ''}`}
            onClick={() => onAiProviderChange('openai')}
          >
            <Bot className="h-3 w-3 mr-1" />
            GPT
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-xs px-2 ${aiProvider === 'anthropic' ? 'bg-white/10' : ''}`}
            onClick={() => onAiProviderChange('anthropic')}
          >
            <UserRound className="h-3 w-3 mr-1" />
            Claude
          </Button>
        </div>
      </div>
    </div>
  );
};
