
import React from 'react';
import { useWritingStep } from './writing/useWritingStep';
import { ContentSidebar } from './writing/ContentSidebar';
import { ContentGenerationHeader } from './writing/ContentGenerationHeader';
import { ContentQualityPanel } from './writing/ContentQualityPanel';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { TitleGenerationButton } from './writing/TitleGenerationButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, FileText, Sparkles, Eye, EyeOff, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export const ContentWritingStep: React.FC = () => {
  const {
    state,
    isGenerating,
    showOutline,
    showGenerator,
    isSaving,
    showSaveDialog,
    setShowSaveDialog,
    saveTitle,
    setSaveTitle,
    saveNote,
    setSaveNote,
    aiProvider,
    additionalInstructions,
    content,
    mainKeyword,
    secondaryKeywords,
    outline,
    selectedSolution,
    autoSaveTimestamp,
    hasUnsavedChanges,
    wordCountLimit,
    handleContentChange,
    handleInstructionsChange,
    handleToggleOutline,
    handleToggleGenerator,
    handleAiProviderChange,
    handleManualSave,
    handleWordCountChange
  } = useWritingStep();

  // Count words in content
  const wordCount = content ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      {/* Header with title generation */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between gap-2">
            <div>Content Title</div>
            <TitleGenerationButton />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.contentTitle ? (
            <p className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue font-medium text-lg">
              {state.contentTitle}
            </p>
          ) : (
            <p className="text-muted-foreground text-base">
              No title set. Generate one with the button above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Content Generation Header */}
      <ContentGenerationHeader
        showOutline={showOutline}
        showGenerator={showGenerator}
        onToggleOutline={handleToggleOutline}
        onToggleGenerator={handleToggleGenerator}
        wordCount={wordCount}
        wordCountLimit={wordCountLimit}
        onWordCountChange={handleWordCountChange}
        aiProvider={aiProvider}
        onAiProviderChange={handleAiProviderChange}
      />

      {/* Content Quality Panel */}
      <ContentQualityPanel />

      {/* Main Content Area - removed the grid section */}
      <div className="flex-1 min-h-[600px]">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Editor
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Auto-save indicator */}
                {autoSaveTimestamp && (
                  <Badge variant="outline" className="text-xs">
                    <Save className="h-3 w-3 mr-1" />
                    Saved {formatDistanceToNow(new Date(autoSaveTimestamp), { addSuffix: true })}
                  </Badge>
                )}
                
                {/* Unsaved changes indicator */}
                {hasUnsavedChanges && (
                  <Badge variant="destructive" className="text-xs">
                    Unsaved changes
                  </Badge>
                )}

                {/* Manual save button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSave}
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Draft
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)]">
            <div className="h-full">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing your content here, or use the AI generator to create content based on your outline..."
                className="w-full h-full resize-none border-0 focus:ring-0 text-base leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sidebar */}
      {(showOutline || showGenerator) && (
        <ContentSidebar
          showOutline={showOutline}
          showGenerator={showGenerator}
          outline={outline}
          isGenerating={isGenerating}
          additionalInstructions={additionalInstructions}
          onInstructionsChange={handleInstructionsChange}
          aiProvider={aiProvider}
          onAiProviderChange={handleAiProviderChange}
          wordCountLimit={wordCountLimit}
          onWordCountChange={handleWordCountChange}
        />
      )}

      {/* Save Content Dialog */}
      <SaveContentDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        content={content}
        title={saveTitle}
        setTitle={setSaveTitle}
        note={saveNote}
        setNote={setSaveNote}
        isSaving={isSaving}
        mainKeyword={mainKeyword}
        secondaryKeywords={secondaryKeywords}
        selectedSolution={selectedSolution}
      />
    </div>
  );
};
