
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PencilLine, Eye, Save, Clock, Sparkles } from 'lucide-react';

export interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  onGenerateContent: () => Promise<void>;
  onToggleOutline: () => void;
  showOutline: boolean;
  outlineLength: number;
  aiProvider: string;
  onAiProviderChange: (provider: string) => void;
  autoSaveTimestamp: string | null;
  hasUnsavedChanges: boolean;
  onManualSave: () => void;
  wordCountLimit: number | null;
}

export const ContentGenerationHeader: React.FC<ContentGenerationHeaderProps> = ({
  isGenerating,
  onGenerateContent,
  onToggleOutline,
  showOutline,
  outlineLength,
  aiProvider,
  onAiProviderChange,
  autoSaveTimestamp,
  hasUnsavedChanges,
  onManualSave,
  wordCountLimit
}) => {
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b">
      <div className="flex items-center gap-3">
        <Button
          variant={showOutline ? "default" : "outline"}
          size="sm"
          onClick={onToggleOutline}
          className="gap-1.5"
        >
          {showOutline ? (
            <>
              <Eye className="h-4 w-4" />
              Outline ({outlineLength})
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Show Outline
            </>
          )}
        </Button>
        
        <Select value={aiProvider} onValueChange={onAiProviderChange}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="AI Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google AI</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-3">
        {(autoSaveTimestamp || hasUnsavedChanges) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {hasUnsavedChanges 
              ? <span>Unsaved changes</span> 
              : <span>Saved at {formatTimestamp(autoSaveTimestamp!)}</span>
            }
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={!hasUnsavedChanges}
          onClick={onManualSave}
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="gap-1.5"
          disabled={isGenerating || outlineLength === 0}
          onClick={onGenerateContent}
        >
          {isGenerating ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <PencilLine className="h-4 w-4" />
              Write Content
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
