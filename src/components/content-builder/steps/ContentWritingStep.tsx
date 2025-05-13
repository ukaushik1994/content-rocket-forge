import React, { useState } from 'react';
import { ContentEditor } from '@/components/content/ContentEditor';
import { toast } from 'sonner';
import { ContentGenerationHeader } from './writing/ContentGenerationHeader';
import { ContentSidebar } from './writing/ContentSidebar';
import { ContentTemplateCard } from './writing/ContentTemplateCard';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { useWritingStep } from './writing/useWritingStep';
import { generateContent, saveContentToDraft } from './writing/ContentGenerationService';
import { Link } from 'react-router-dom';
import { OutlineSection } from '@/contexts/content-builder/types';

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

  // Add state for selected countries
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['us']);

  const addSection = () => {
    const newSection = {
      id: Math.random().toString(36).substr(2, 9),
      title: "New Section",
      level: 2 as const,
      type: "heading" as const, // Use a valid type from the union type
      content: ""
    };
    
    setOutlineSections([...outlineSections, newSection]);
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
            return `${index + 1}. ${(item as OutlineSection).title}`;
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
      handleContentChange,
      selectedCountries
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

  return (
    <div className="space-y-6 h-full flex flex-col">
      <ContentGenerationHeader
        isGenerating={isGenerating}
        handleGenerateContent={handleGenerateContent}
        handleToggleOutline={handleToggleOutline}
        handleToggleGenerator={handleToggleGenerator}
        showOutline={showOutline}
        outlineLength={state.outline.length}
        aiProvider={aiProvider}
        onAiProviderChange={handleAiProviderChange}
        selectedCountries={selectedCountries}
        onCountriesChange={setSelectedCountries}
      />
      
      {showGenerator && (
        <ContentTemplateCard
          serpData={state.serpData}
          onGenerateContent={handleContentTemplateSelection}
          mainKeyword={mainKeyword}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {showOutline && (
          <div className="lg:col-span-1 space-y-4 h-full">
            <ContentSidebar
              outline={outline}
              selectedSolution={selectedSolution}
              additionalInstructions={additionalInstructions}
              handleInstructionsChange={handleInstructionsChange}
            />
          </div>
        )}
        
        <div className={`${showOutline ? 'lg:col-span-2' : 'lg:col-span-3'} h-full flex`}>
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
