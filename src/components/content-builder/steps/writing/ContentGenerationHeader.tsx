import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Eye, EyeOff, Clock, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

export interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  onGenerateContent: () => Promise<void>;
  onToggleOutline: () => void;
  showOutline: boolean;
  outlineLength: number;
  aiProvider?: string;
  onAiProviderChange?: (provider: string) => void;
  autoSaveTimestamp?: string | null;
  hasUnsavedChanges?: boolean;
  onManualSave?: () => void;
  wordCountLimit?: number | null;
}

export const ContentGenerationHeader: React.FC<ContentGenerationHeaderProps> = ({
  isGenerating,
  onGenerateContent,
  onToggleOutline,
  showOutline,
  outlineLength,
  aiProvider = 'openai',
  onAiProviderChange,
  autoSaveTimestamp,
  hasUnsavedChanges,
  onManualSave,
  wordCountLimit
}) => {
  const handleGenerateContent = async () => {
    await onGenerateContent();
  };

  const renderAiProviderSelector = () => {
    return (
      <div className="flex items-center space-x-2">
        <div className="text-xs text-muted-foreground">AI:</div>
        <select 
          className="text-xs bg-background border border-input rounded px-2 py-1"
          value={aiProvider}
          onChange={(e) => onAiProviderChange?.(e.target.value)}
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>
    );
  };

  const renderAutoSaveStatus = () => {
    if (!autoSaveTimestamp && !hasUnsavedChanges) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1 text-xs">
              {hasUnsavedChanges ? (
                <>
                  <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-muted-foreground">Unsaved changes</span>
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Saved {autoSaveTimestamp && formatDistanceToNow(new Date(autoSaveTimestamp), { addSuffix: true })}
                  </span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {hasUnsavedChanges 
              ? "You have unsaved changes. Click Save to preserve your work." 
              : `Last saved: ${autoSaveTimestamp ? new Date(autoSaveTimestamp).toLocaleString() : 'Unknown'}`
            }
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className={`text-xs ${showOutline ? 'bg-muted' : ''}`}
              onClick={onToggleOutline}
            >
              {showOutline ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1" />
                  Hide Outline
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Show Outline
                </>
              )}
              {outlineLength > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {outlineLength}
                </Badge>
              )}
            </Button>
            
            {renderAiProviderSelector()}
            
            {wordCountLimit && (
              <div className="text-xs text-muted-foreground">
                Target: ~{wordCountLimit} words
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {renderAutoSaveStatus()}
            
            {onManualSave && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={onManualSave}
                disabled={!hasUnsavedChanges}
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
            )}
            
            <Button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              size="sm"
            >
              {isGenerating ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
