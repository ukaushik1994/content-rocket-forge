
import React from 'react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { TitleGenerationButton } from './TitleGenerationButton';
import { WordCountToggle } from './WordCountToggle';
import { ImageAutoGenToggle } from './ImageAutoGenToggle';
import { 
  Sparkles, 
  ListTodo, 
  CheckSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SimpleAIServiceIndicator } from '../../ai/SimpleAIServiceIndicator';

interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  handleGenerateContent: () => void;
  handleToggleOutline: () => void;
  showOutline: boolean;
  outlineLength: number;
  
  // Word Count Props
  wordCountMode: 'ai' | 'custom';
  onWordCountModeChange: (mode: 'ai' | 'custom') => void;
  aiEstimatedWordCount: number | null;
  customWordCount: number;
  onWordCountChange: (count: number) => void;
  
  // Image Auto-Gen Props
  autoGenerateImages?: boolean;
  onAutoGenerateImagesChange?: (enabled: boolean) => void;
  isGeneratingImages?: boolean;
  imagesCount?: number;
  imageProviderAvailable?: boolean;
  
  autoSaveTimestamp?: string | null;
  hasUnsavedChanges?: boolean;
  onManualSave?: () => void;
}

export const ContentGenerationHeader: React.FC<ContentGenerationHeaderProps> = ({
  isGenerating,
  handleGenerateContent,
  handleToggleOutline,
  showOutline,
  outlineLength,
  wordCountMode,
  onWordCountModeChange,
  aiEstimatedWordCount,
  customWordCount,
  onWordCountChange,
  autoGenerateImages = true,
  onAutoGenerateImagesChange,
  isGeneratingImages = false,
  imagesCount = 0,
  imageProviderAvailable = true,
  autoSaveTimestamp,
  hasUnsavedChanges
}) => {
  const activeWordCount = wordCountMode === 'ai' 
    ? (aiEstimatedWordCount || 1500)
    : customWordCount;

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
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
                {activeWordCount > 0 && (
                  <span className="ml-1.5 text-xs opacity-75">({activeWordCount} words)</span>
                )}
              </>
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
          
          {/* Word Count Toggle */}
          <WordCountToggle
            mode={wordCountMode}
            onModeChange={onWordCountModeChange}
            aiEstimate={aiEstimatedWordCount}
            customValue={customWordCount}
            onCustomValueChange={onWordCountChange}
          />
          
          {/* Image Auto-Gen Toggle */}
          {onAutoGenerateImagesChange && (
            <ImageAutoGenToggle
              enabled={autoGenerateImages}
              onEnabledChange={onAutoGenerateImagesChange}
              isGenerating={isGeneratingImages}
              imagesCount={imagesCount}
              providerAvailable={imageProviderAvailable}
            />
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* AI Service Status */}
          <SimpleAIServiceIndicator size="md" />
          
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
