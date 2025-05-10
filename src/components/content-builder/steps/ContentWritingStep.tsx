import React, { useState, useEffect } from 'react';
import { ContentEditor } from '@/components/content/ContentEditor';
import { toast } from 'sonner';
import { ContentGenerationHeader } from './writing/ContentGenerationHeader';
import { ContentSidebar } from './writing/ContentSidebar';
import { ContentTemplateCard } from './writing/ContentTemplateCard';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { useWritingStep } from './writing/useWritingStep';
import { generateContent, saveContentToDraft } from './writing/ContentGenerationService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InterLinkingSuggestions } from '@/components/approval/interlinking/InterLinkingSuggestions';
import { Link as LinkIcon } from 'lucide-react';

export const ContentWritingStep = () => {
  const {
    state,
    isGenerating,
    setIsGenerating,
    showOutline,
    showGenerator,
    isSaving,
    setIsSaving,
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
    handleContentChange,
    handleInstructionsChange,
    handleToggleOutline,
    handleToggleGenerator,
    handleContentTemplateSelection,
    handleAiProviderChange
  } = useWritingStep();

  const [showInterlinking, setShowInterlinking] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'outline' | 'interlinking'>('outline');
  
  // Create a fake content item for the interlinking suggestions
  const fakeContentItem = {
    id: 'draft-content',
    title: saveTitle || state.contentTitle || mainKeyword || 'Draft Content',
    content: content,
    status: 'draft' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seo_score: 0,
    keywords: secondaryKeywords || [],
    user_id: 'current-user',
    metadata: {
      mainKeyword: mainKeyword,
      secondaryKeywords: secondaryKeywords || []
    }
  };

  const handleGenerateContent = async () => {
    if (!mainKeyword) {
      toast.error("Please set a main keyword first");
      return;
    }
    
    // Convert outline to a formatted string for the prompt
    const outlineText = Array.isArray(state.outline) 
      ? state.outline.map((item, index) => {
          if (typeof item === 'string') {
            return `${index + 1}. ${item}`;
          } else if (item && typeof item === 'object' && 'title' in item) {
            return `${index + 1}. ${(item as { title: string }).title}`;
          }
          return '';
        }).filter(Boolean).join('\n')
      : '';
        
    // Prepare secondary keywords
    const secondaryKeywordsStr = state.selectedKeywords?.join(', ') || '';
    
    await generateContent(
      aiProvider,
      mainKeyword,
      state.contentTitle,
      outlineText,
      secondaryKeywordsStr,
      selectedSolution,
      additionalInstructions,
      setIsGenerating,
      handleContentChange
    );
  };
  
  const handleSaveToDraft = async () => {
    await saveContentToDraft(
      saveTitle,
      content,
      mainKeyword,
      secondaryKeywords || [],
      saveNote,
      Array.isArray(outline) ? outline.map(item => typeof item === 'string' ? item : item.title) : [],
      setIsSaving,
      setShowSaveDialog
    );
  };

  const handleToggleInterlinking = () => {
    setShowInterlinking(!showInterlinking);
    if (!showInterlinking) {
      setSidebarTab('interlinking');
    } else {
      setSidebarTab('outline');
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <ContentGenerationHeader
        isGenerating={isGenerating}
        handleGenerateContent={handleGenerateContent}
        handleToggleOutline={handleToggleOutline}
        handleToggleInterlinking={handleToggleInterlinking}
        handleToggleGenerator={handleToggleGenerator}
        showOutline={showOutline}
        showInterlinking={showInterlinking}
        outlineLength={state.outline.length}
        aiProvider={aiProvider}
        onAiProviderChange={handleAiProviderChange}
      />
      
      {showGenerator && (
        <ContentTemplateCard
          serpData={state.serpData}
          onGenerateContent={handleContentTemplateSelection}
          mainKeyword={mainKeyword}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {(showOutline || showInterlinking) && (
          <div className="lg:col-span-1 space-y-4 h-full">
            <Tabs value={sidebarTab} onValueChange={(value) => setSidebarTab(value as 'outline' | 'interlinking')}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="outline" disabled={!showOutline}>Outline</TabsTrigger>
                <TabsTrigger value="interlinking" disabled={!showInterlinking}>Interlinking</TabsTrigger>
              </TabsList>
              
              <TabsContent value="outline" className="mt-0">
                {showOutline && (
                  <ContentSidebar
                    outline={outline}
                    selectedSolution={selectedSolution}
                    additionalInstructions={additionalInstructions}
                    handleInstructionsChange={handleInstructionsChange}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="interlinking" className="mt-0">
                {showInterlinking && content && content.length > 100 && (
                  <InterLinkingSuggestions content={fakeContentItem} />
                )}
                
                {showInterlinking && (!content || content.length <= 100) && (
                  <div className="text-center p-6 bg-white/5 border border-white/10 rounded-lg">
                    <LinkIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Add more content to see interlinking suggestions</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        <div className={`${(showOutline || showInterlinking) ? 'lg:col-span-2' : 'lg:col-span-3'} h-full flex`}>
          <ContentEditor
            content={content}
            onContentChange={handleContentChange}
          />
        </div>
      </div>

      <SaveContentDialog
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        saveTitle={saveTitle}
        setSaveTitle={setSaveTitle}
        saveNote={saveNote}
        setSaveNote={setSaveNote}
        handleSaveToDraft={handleSaveToDraft}
        isSaving={isSaving}
        mainKeyword={mainKeyword}
        secondaryKeywords={secondaryKeywords || []}
        content={content}
        outlineLength={state.outline.length}
      />
    </div>
  );
};
