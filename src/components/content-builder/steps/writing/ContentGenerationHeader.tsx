
import React from 'react';
import { Button } from '@/components/ui/button';
import { AiProvider } from '@/services/aiService/types';
import { Wand2, Eye, EyeOff, Save, RotateCw } from 'lucide-react';
import { AiProviderSelector } from '@/components/content-builder/outline/ai-generator/AiProviderSelector';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  handleGenerateContent: () => void;
  handleToggleOutline: () => void;
  showOutline: boolean;
  outlineLength: number;
  aiProvider: AiProvider;
  onAiProviderChange: (provider: AiProvider) => void;
  autoSaveTimestamp: string | null;
  hasUnsavedChanges: boolean;
  onManualSave: () => void;
  wordCountLimit: number | null;
}

export const ContentGenerationHeader = ({
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
  wordCountLimit
}: ContentGenerationHeaderProps) => {
  const lastSaved = autoSaveTimestamp 
    ? new Date(autoSaveTimestamp).toLocaleTimeString() 
    : null;
    
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleGenerateContent}
          disabled={isGenerating}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          {isGenerating ? (
            <>
              <RotateCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
        
        <div className="hidden sm:flex items-center gap-1.5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToggleOutline}
            className="gap-1 bg-white/5 hover:bg-white/10 text-sm border-white/10"
          >
            {showOutline ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                Hide Outline
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                Show Outline ({outlineLength})
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {wordCountLimit && (
          <Badge variant="outline" className="bg-white/5 text-xs py-0.5 px-2">
            {wordCountLimit} words target
          </Badge>
        )}
        
        <AiProviderSelector 
          selectedProvider={aiProvider}
          onProviderChange={onAiProviderChange}
          size="sm"
          variant="outline"
          className="bg-white/5 hover:bg-white/10 border-white/10"
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 text-xs border border-white/10 bg-white/5 hover:bg-white/10"
            >
              <Save className="h-3.5 w-3.5" />
              {hasUnsavedChanges ? 'Unsaved' : 'Saved'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Content Saving</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {lastSaved && (
              <DropdownMenuItem disabled>
                Last saved at {lastSaved}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={onManualSave}>
              Save manually now
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-xs opacity-50">
              Content is auto-saved every 30 seconds
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
