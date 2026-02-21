import React, { useEffect, useState, useCallback } from 'react';
import { EnhancedContentEditor } from './editor/EnhancedContentEditor';
import { MinimalisticSidebar } from './writing/MinimalisticSidebar';
import { toast } from 'sonner';
import { ContentGenerationHeader } from './writing/ContentGenerationHeader';
import { SaveContentDialog } from './writing/SaveContentDialog';
import { useWritingStep } from './writing/useWritingStep';
import { generateAdvancedContent, ContentGenerationConfig } from '@/services/advancedContentGeneration';
import { saveContentToDraft } from './writing/ContentGenerationService';
import { useTitleSuggestions } from '@/hooks/final-review/useTitleSuggestions';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { extractTitleFromContent } from '@/utils/content/extractTitle';
import { AttachedImagesGallery, AttachedImage } from '@/components/content/AttachedImagesGallery';
import { imageGenOrchestrator } from '@/services/imageGenOrchestrator';
import { ImageSlot } from '@/components/content/ImagePlaceholder';

export const ContentWritingStep = () => {
  const {
    state,
    isGenerating,
    setIsGenerating,
    showOutline,
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
    autoSaveTimestamp,
    hasUnsavedChanges,
    wordCountLimit,
    wordCountMode,
    aiEstimatedWordCount,
    customWordCount,
    activeWordCount,
    handleContentChange,
    handleInstructionsChange,
    handleToggleOutline,
    handleToggleGenerator,
    handleAiProviderChange,
    handleManualSave,
    handleWordCountChange,
    handleWordCountModeChange
  } = useWritingStep();
  
  const [writingStyle, setWritingStyle] = useState('Conversational');
  const [expertiseLevel, setExpertiseLevel] = useState('Beginner');
  const [contentType, setContentType] = useState<'how-to' | 'listicle' | 'comprehensive' | 'general'>('general');
  const [includeStats, setIncludeStats] = useState(true);
  const [includeCaseStudies, setIncludeCaseStudies] = useState(true);
  const [includeFAQs, setIncludeFAQs] = useState(true);
  
  // Image generation state
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [autoGenerateImages, setAutoGenerateImages] = useState(true);
  const [imageProviderAvailable, setImageProviderAvailable] = useState(false);
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([]);
  
  // Extract title from content
  const extractedTitle = extractTitleFromContent(content);

  // Check if image provider is available on mount
  useEffect(() => {
    const checkProvider = async () => {
      const available = await imageGenOrchestrator.isAvailable();
      setImageProviderAvailable(available);
    };
    checkProvider();
  }, []);

  const handleGenerateMoreImages = async () => {
    if (!content || content.length < 200) {
      toast.error('Please generate some content first');
      return;
    }
    
    setIsGeneratingImages(true);
    try {
      const image = await imageGenOrchestrator.generateSingleImage(
        `Professional illustration for: ${mainKeyword}. ${extractedTitle || ''}`
      );
      if (image) {
        setAttachedImages(prev => [...prev, image]);
        toast.success('Image generated successfully!');
      } else {
        toast.error('No image provider configured. Please set up in Settings.');
      }
    } catch (error) {
      toast.error('Image generation failed');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleDeleteImage = (image: AttachedImage) => {
    setAttachedImages(prev => prev.filter(img => img.id !== image.id));
    toast.success('Image removed');
  };

  const handleInsertImage = (image: AttachedImage) => {
    const imageMarkdown = `\n\n![${image.prompt}](${image.url})\n\n`;
    handleContentChange(content + imageMarkdown);
    toast.success('Image inserted into content');
  };
  const handleGenerateContent = async () => {
    if (!mainKeyword) {
      toast.error("Please set a main keyword first");
      return;
    }
    
    
    // Prepare outline text from state.outline
    const outlineText = Array.isArray(state.outline)
      ? state.outline
          .map((item, index) => {
            if (typeof item === 'string') return `${index + 1}. ${item}`;
            if (item && typeof item === 'object' && 'title' in item) return `${index + 1}. ${(item as { title: string }).title}`;
            return '';
          })
          .filter(Boolean)
          .join('\n')
      : '';

    const config: ContentGenerationConfig = {
      mainKeyword,
      title: state.contentTitle || `${mainKeyword}: Expert Guide`,
      outline: outlineText,
      secondaryKeywords: state.selectedKeywords?.join(', ') || '',
      writingStyle,
      expertiseLevel,
      targetLength: activeWordCount || 1500,
      contentType,
      contentIntent: state.contentIntent,
      serpSelections: state.serpSelections || [],
      selectedSolution,
      additionalInstructions,
      includeStats,
      includeCaseStudies,
      includeFAQs,
      formatType: state.contentType,
    };
    setIsGenerating(true);
    
    try {
      // Prioritize OpenRouter for content generation
      const primaryProvider = aiProvider === 'openrouter' ? 'openrouter' : aiProvider;
      const generatedContent = await generateAdvancedContent(config, primaryProvider);
      if (generatedContent) {
        handleContentChange(generatedContent);
        toast.success(`Content generated successfully using ${primaryProvider}!`);
        
        // ========================================
        // AUTO-GENERATE IMAGES after content is created
        // ========================================
        if (autoGenerateImages && imageProviderAvailable && generatedContent.length > 500) {
          await autoGenerateImagesForContent(generatedContent);
        }
      }
    } catch (error) {
      toast.error(`Content generation failed with ${aiProvider}. Please try another provider.`);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Auto-generate images for content after it's created
   */
  const autoGenerateImagesForContent = async (generatedContent: string) => {
    try {
      const analysis = imageGenOrchestrator.analyzeContent(generatedContent);
      
      if (!analysis.shouldGenerate || analysis.suggestedCount === 0) {
        console.log('[Image Auto-Gen] Content too short or no slots detected');
        return;
      }

      toast.info(`Generating ${analysis.suggestedCount} images...`, {
        id: 'image-gen-progress',
        duration: 30000
      });

      setIsGeneratingImages(true);
      setImageSlots(analysis.slots);

      const result = await imageGenOrchestrator.orchestrateForContent(generatedContent, {
        maxImages: 3, // Limit to 3 images max
        onSlotUpdate: (updatedSlot) => {
          setImageSlots(prev => 
            prev.map(s => s.id === updatedSlot.id ? updatedSlot : s)
          );
        },
        onComplete: (images) => {
          setAttachedImages(prev => [...prev, ...images]);
          toast.success(`Generated ${images.length} images!`, { id: 'image-gen-progress' });
        },
        onError: (error) => {
          toast.error(`Image generation failed: ${error.message}`, { id: 'image-gen-progress' });
        }
      });

      if (!result.success && result.errors.length > 0) {
        console.error('[Image Auto-Gen] Errors:', result.errors);
      }
    } catch (error) {
      console.error('[Image Auto-Gen] Failed:', error);
      toast.dismiss('image-gen-progress');
    } finally {
      setIsGeneratingImages(false);
    }
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
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative z-10 max-w-full mx-auto px-4 pt-4 pb-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent">
            {extractedTitle || 'Create Amazing Content'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enhanced editor with real-time SERP integration analysis
          </p>
        </div>

        <div className="mb-4">
          <ContentGenerationHeader
            isGenerating={isGenerating}
            handleGenerateContent={handleGenerateContent}
            handleToggleOutline={handleToggleOutline}
            showOutline={showOutline}
            outlineLength={state.outline.length}
            wordCountMode={wordCountMode}
            onWordCountModeChange={handleWordCountModeChange}
            aiEstimatedWordCount={aiEstimatedWordCount}
            customWordCount={customWordCount}
            onWordCountChange={handleWordCountChange}
            autoGenerateImages={autoGenerateImages}
            onAutoGenerateImagesChange={setAutoGenerateImages}
            isGeneratingImages={isGeneratingImages}
            imagesCount={attachedImages.length}
            imageProviderAvailable={imageProviderAvailable}
            autoSaveTimestamp={autoSaveTimestamp}
            hasUnsavedChanges={hasUnsavedChanges}
            onManualSave={handleManualSave}
          />
        </div>
        
        <div className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden h-[calc(100vh-200px)]">
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Enhanced Content Editor</h3>
                <p className="text-sm text-muted-foreground">With real-time SERP integration highlighting</p>
              </div>
            </div>
            
            <div className="flex-1">
              <EnhancedContentEditor
                content={content}
                onChange={handleContentChange}
                onSave={handleManualSave}
                isGenerating={isGenerating}
                title="Content Editor"
                className="h-full"
              />
            </div>
            
            {autoSaveTimestamp && (
              <div className="mt-4 text-xs text-muted-foreground text-center px-4 py-2 bg-muted/50 rounded-lg">
                Auto-saved at {new Date(autoSaveTimestamp).toLocaleTimeString()}
              </div>
            )}
            
            {/* Attached Images Gallery */}
            <div className="mt-4">
              <AttachedImagesGallery
                images={attachedImages}
                onGenerateMore={handleGenerateMoreImages}
                onInsertIntoContent={handleInsertImage}
                onDelete={handleDeleteImage}
                isGenerating={isGeneratingImages}
                compact
              />
            </div>
          </div>
        </div>
      </div>

      {/* Minimalistic Floating Sidebar */}
      <MinimalisticSidebar
        content={content}
        serpSelections={state.serpSelections}
        outline={state.outline}
        selectedSolution={selectedSolution}
        additionalInstructions={additionalInstructions}
        onIntegrateItem={(item) => {
          toast.info(`Integration suggestion for: ${item.type.replace(/_/g, ' ')}`);
        }}
        onInstructionsChange={handleInstructionsChange}
      />

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
    </motion.div>
  );
};
