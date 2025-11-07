import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import AIServiceController from '@/services/aiService/AIServiceController';
import { AIInstructionsInput } from '../AIInstructionsInput';
import { AIGenerateButton } from '../AIGenerateButton';
import { AiProviderSelector } from './AiProviderSelector';
import { OutlineSection } from '@/contexts/content-builder/types/outline-types';
import { getUserPreference } from '@/services/userPreferencesService';
import { AiProvider } from '@/services/aiService/types';
import { generateTitleSuggestions } from '@/utils/seo/titles/generateTitleSuggestions';

export function OutlineGenerator() {
  const { state, dispatch, setAdditionalInstructions } = useContentBuilder();
  const { 
    mainKeyword, 
    selectedKeywords,
    serpSelections,
    contentTitle,
    additionalInstructions,
    outline
  } = state;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [customInstructions, setCustomInstructions] = useState(additionalInstructions || '');
  const [aiProvider, setAiProvider] = useState<AiProvider>('openrouter');
  const [availableProviders, setAvailableProviders] = useState<AiProvider[]>([]);
  
  // Load available providers and default AI provider preference
  useEffect(() => {
    const initProviders = async () => {
      const activeProviders = await AIServiceController.getActiveProviders();
      const providerNames = activeProviders.map(p => p.provider as AiProvider);
      setAvailableProviders(providerNames);
      
      // Set default provider from preferences or best available
      const defaultProvider = getUserPreference('defaultAiProvider') as AiProvider;
      if (defaultProvider && providerNames.includes(defaultProvider)) {
        setAiProvider(defaultProvider);
      } else if (activeProviders.length > 0) {
        // Use highest priority provider
        const bestProvider = activeProviders.sort((a, b) => a.priority - b.priority)[0];
        setAiProvider(bestProvider.provider as AiProvider);
      }
    };
    
    initProviders();
  }, []);
  
  const selectedItems = serpSelections.filter(item => item.selected);
  const totalSelectedItems = selectedItems.length;
  const hasOutline = outline.length > 0;

  // Generate an AI outline based on selections and keywords
  const handleGenerateOutline = async () => {
    if (!mainKeyword) {
      toast.error("Please set a main keyword first");
      return;
    }
    
    try {
      setIsGenerating(true);
      
      const outlinePrompt = createPrompt(
        mainKeyword, 
        selectedKeywords, 
        selectedItems, 
        customInstructions
      );
      
      console.info("AI Generation prompt:", outlinePrompt);
      
      // Check if provider is available and active
      if (!availableProviders.includes(aiProvider)) {
        toast.error(`${aiProvider} is not configured or active. Please check your provider settings.`);
        setIsGenerating(false);
        return;
      }
      
      const result = await generateOutlineWithFallback(outlinePrompt, aiProvider);
      
      if (!result.success) {
        toast.error(result.error || "Failed to generate outline");
        return;
      }
      
      await processOutlineResult(result.outlineText);
      
    } catch (error) {
      console.error("Error generating AI outline:", error);
      toast.error("Failed to generate outline. Please check your API configuration or try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const createPrompt = (
    mainKeyword: string,
    selectedKeywords: string[],
    selectedItems: Array<{type: string, content: string, selected: boolean}>,
    customInstructions: string
  ) => {
    // Create a detailed prompt for the AI
    const selectedItemsText = selectedItems.map(item => 
      `${item.type.toUpperCase()}: ${item.content}`
    ).join('\n\n');
    
    const keywordsText = selectedKeywords.join(', ');
    
    return `
    Create a detailed content outline for an article about "${mainKeyword}".
    
    Primary keyword: ${mainKeyword}
    Secondary keywords: ${keywordsText}
    
    I've researched the topic and gathered these key points:
    ${selectedItemsText}
    
    ${customInstructions ? `Additional instructions: ${customInstructions}` : ''}
    
    Please generate a well-structured outline with these requirements:
    1. Include at least 5-7 main sections with descriptive headings
    2. Format the outline with clear hierarchy
    3. Focus on covering the topic comprehensively
    4. Ensure all selected keywords are addressed
    5. Optimize for search intent and reader value
    
    Return ONLY the outline in this exact format:
    1. [First Section Title]
    2. [Second Section Title]
    3. [Third Section Title]
    (and so on)
    `;
  };
  
  const generateOutlineWithFallback = async (prompt: string, primaryProvider: AiProvider) => {
    try {
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'outline_generation',
        temperature: 0.7,
        max_tokens: 1500
      });
      
      if (response?.content) {
        return {
          success: true,
          outlineText: response.content
        };
      } else {
        return {
          success: false,
          error: 'AI service failed to generate outline. Please check your configuration.'
        };
      }
    } catch (error) {
      console.error('Error generating outline:', error);
      return {
        success: false,
        error: 'AI service failed to generate outline. Please check your configuration.'
      };
    }
  };
  
  const processOutlineResult = async (outlineText: string) => {
    // Parse the outline into an array of strings (one per line)
    const outlineArray = outlineText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.match(/^\d+\.\s/) || line.match(/^[IVX]+\.\s/)) // Only include numbered lines
      .map(line => line.replace(/^\d+\.\s/, '').replace(/^[IVX]+\.\s/, '')); // Remove numbering
    
    if (outlineArray.length === 0) {
      toast.error("Could not parse the generated outline. Please try again.");
      return;
    }
    
    // Convert string[] to OutlineSection[] before dispatching
    const outlineSections: OutlineSection[] = outlineArray.map((title, index) => ({
      id: `section-${index}`,
      title,
      level: 1
    }));
    dispatch({ type: 'SET_OUTLINE', payload: outlineSections });
    
    // ✨ AI: Estimate word count after outline is generated
    try {
      const { estimateOptimalWordCount } = await import('@/services/aiWordCountEstimator');
      const estimatedWordCount = await estimateOptimalWordCount({
        title: contentTitle || mainKeyword,
        outline: outlineSections,
        contentType: state.contentType,
        contentFormat: state.contentFormat,
        serpData: state.serpData,
        selectedKeywords: selectedKeywords
      });
      
      dispatch({ type: 'SET_AI_ESTIMATED_WORD_COUNT', payload: estimatedWordCount });
      dispatch({ type: 'SET_WORD_COUNT_MODE', payload: 'ai' }); // Default to AI mode
      
      console.info(`✨ AI estimated word count: ${estimatedWordCount} words`);
    } catch (error) {
      console.error('Failed to estimate word count:', error);
      // Fallback to default (1500)
      dispatch({ type: 'SET_AI_ESTIMATED_WORD_COUNT', payload: 1500 });
    }
    
    // Generate smart title if none exists
    if (!contentTitle) {
      await generateAndSetSmartTitle();
    }
    
    // Mark the outline step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
    
    toast.success(`AI outline generated with ${outlineArray.length} sections`);
  };
  
  const generateAndSetSmartTitle = async () => {
    try {
      const content = selectedItems.map(item => item.content).join('\n');
      const titles = await generateTitleSuggestions(
        content,
        mainKeyword,
        selectedKeywords
      );
      
      if (titles.length > 0) {
        dispatch({ type: 'SET_CONTENT_TITLE', payload: titles[0] });
        dispatch({ type: 'SET_SUGGESTED_TITLES', payload: titles.slice(1, 6) });
      }
    } catch (error) {
      console.error('Failed to generate smart title:', error);
      // Only use fallback if absolutely necessary
      const fallbackTitle = `${mainKeyword} Guide: Key Insights and Strategies`;
      dispatch({ type: 'SET_CONTENT_TITLE', payload: fallbackTitle });
    }
  };

  const handleSaveInstructions = () => {
    setAdditionalInstructions(customInstructions);
    toast.success("Instructions saved");
  };

  return (
    <Card className="border-neon-purple/20 bg-gradient-to-br from-indigo-950/20 to-black/30">
      <AnimatePresence>
        {!hasOutline && (
          <motion.div
            initial={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <CardContent className="pt-3">
              <div className="text-sm font-medium text-white/90 mb-3 pb-2 border-b border-white/10">
                AI Outline Generator
              </div>
              
              <div className="space-y-3">
                {/* AI Service Status */}
                <AiProviderSelector />
                
                {availableProviders.length === 0 && (
                  <div className="bg-amber-900/20 border border-amber-500/30 p-3 rounded-md text-sm text-amber-200">
                    No AI provider API keys configured. Please add at least one AI provider API key in Settings.
                  </div>
                )}
                
                {/* Additional Instructions */}
                <AIInstructionsInput 
                  customInstructions={customInstructions}
                  setCustomInstructions={setCustomInstructions}
                  onSave={handleSaveInstructions}
                />
                
                {/* Generate Button */}
                <AIGenerateButton
                  isGenerating={isGenerating}
                  onGenerate={handleGenerateOutline}
                  disabled={!mainKeyword || availableProviders.length === 0}
                  totalSelectedItems={totalSelectedItems}
                  mainKeyword={mainKeyword}
                />
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
