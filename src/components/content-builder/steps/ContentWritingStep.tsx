
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ContentEditor } from '@/components/content/ContentEditor';
import { OutlineSection } from '@/contexts/content-builder/types';
import { toast } from 'sonner';
import { ContentGenerationHeader } from './writing/ContentGenerationHeader';
import { ContentSidebar } from './writing/ContentSidebar';
import { ContentTemplateCard } from './writing/ContentTemplateCard';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { sendChatRequest } from '@/services/aiService';

export const ContentWritingStep = () => {
  const { state, dispatch, setAdditionalInstructions } = useContentBuilder();
  const { 
    mainKeyword, 
    outline, 
    content, 
    additionalInstructions, 
    serpData, 
    selectedSolution,
    contentTitle
  } = state;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState(contentTitle || mainKeyword || '');
  const [saveNote, setSaveNote] = useState('');
  const [aiProvider, setAiProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');

  // Mark this step as complete when we have content
  useEffect(() => {
    if (content && content.trim().length > 100) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
    }
  }, [content, dispatch]);

  useEffect(() => {
    if (contentTitle && contentTitle !== saveTitle) {
      setSaveTitle(contentTitle);
    }
  }, [contentTitle, saveTitle]);

  const handleContentChange = (newContent: string) => {
    dispatch({ type: 'SET_CONTENT', payload: newContent });
  };

  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalInstructions(e.target.value);
  };

  const handleGenerateContent = async () => {
    if (!mainKeyword) {
      toast.error("Please set a main keyword first");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Convert outline to a formatted string for the prompt
      const outlineText = Array.isArray(outline) 
        ? outline.map((item, index) => {
            if (typeof item === 'string') {
              return `${index + 1}. ${item}`;
            } else {
              return `${index + 1}. ${item.title}`;
            }
          }).join('\n')
        : '';
        
      // Prepare secondary keywords
      const secondaryKeywords = state.selectedKeywords?.join(', ') || '';
      
      // Create a detailed prompt for the AI
      const prompt = `
      Write comprehensive, high-quality content for an article about "${mainKeyword}".
      
      Title: ${contentTitle || `Complete Guide to ${mainKeyword}`}
      Primary Keyword: ${mainKeyword}
      ${secondaryKeywords ? `Secondary Keywords: ${secondaryKeywords}` : ''}
      
      Use this outline structure:
      ${outlineText}
      
      ${selectedSolution ? `This content should mention the solution "${selectedSolution.name}" and highlight these features: ${selectedSolution.features.slice(0,3).join(', ')}.` : ''}
      
      ${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ''}
      
      Format the content using Markdown syntax, with proper headings, paragraphs, and emphasis. 
      Include a compelling introduction and a strong conclusion. 
      Optimize the content for readability and search engines.
      `;
      
      // Call the AI API via our service
      console.info("AI Content Generation prompt:", prompt);
      
      const chatResponse = await sendChatRequest(aiProvider, {
        messages: [
          { role: 'system', content: 'You are an expert content writer specializing in SEO-optimized articles. Create comprehensive, well-structured content that follows the provided outline and incorporates the specified keywords naturally.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        maxTokens: 4000
      });
      
      if (chatResponse?.choices?.[0]?.message?.content) {
        // Use the AI-generated content
        const generatedContent = chatResponse.choices[0].message.content;
        dispatch({ type: 'SET_CONTENT', payload: generatedContent });
        toast.success('Content generated successfully');
      } else {
        toast.error('Failed to generate content. Please check your API key configuration or try another provider.');
      }
      
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again or check your API configuration.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleToggleOutline = () => {
    setShowOutline(!showOutline);
  };
  
  const handleToggleGenerator = () => {
    setShowGenerator(!showGenerator);
  };

  const handleContentTemplateSelection = (template: string) => {
    dispatch({ type: 'SET_CONTENT', payload: template });
    setShowGenerator(false);
    toast.success('Content template applied');
  };
  
  const handleSaveToDraft = async () => {
    if (!saveTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Content saved successfully to your repository');
      setShowSaveDialog(false);
      
      // In a real app, this would save to a database
      console.log('Saved content:', {
        title: saveTitle,
        content,
        keyword: mainKeyword,
        note: saveNote
      });
      
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAiProviderChange = (provider: 'openai' | 'anthropic' | 'gemini') => {
    setAiProvider(provider);
  };

  // Convert outline to the appropriate format for the sidebar component
  const processedOutline = Array.isArray(outline) 
    ? outline.map(item => {
        if (typeof item === 'string') {
          return { id: Math.random().toString(), title: item, level: 2 };
        }
        return item as OutlineSection;
      })
    : [];

  return (
    <div className="space-y-6">
      <ContentGenerationHeader
        isGenerating={isGenerating}
        handleGenerateContent={handleGenerateContent}
        handleToggleOutline={handleToggleOutline}
        handleToggleGenerator={handleToggleGenerator}
        showOutline={showOutline}
        outlineLength={outline.length}
        aiProvider={aiProvider}
        onAiProviderChange={handleAiProviderChange}
      />
      
      {showGenerator && (
        <ContentTemplateCard
          serpData={serpData}
          onGenerateContent={handleContentTemplateSelection}
          mainKeyword={mainKeyword}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {showOutline && (
          <div className="lg:col-span-1 space-y-4">
            <ContentSidebar
              outline={processedOutline}
              selectedSolution={selectedSolution}
              additionalInstructions={additionalInstructions}
              handleInstructionsChange={handleInstructionsChange}
            />
          </div>
        )}
        
        <div className={showOutline ? 'lg:col-span-2' : 'lg:col-span-3'}>
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
        content={content}
        outlineLength={outline.length}
      />
    </div>
  );
};
