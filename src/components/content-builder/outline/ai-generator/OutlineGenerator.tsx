import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import AIServiceController from '@/services/aiService/AIServiceController';
import { AIInstructionsInput } from '../AIInstructionsInput';
import { AIGenerateButton } from '../AIGenerateButton';
import { AiProviderSelector } from './AiProviderSelector';
import { getUserPreference } from '@/services/userPreferencesService';
import { hasApiKey } from '@/services/apiKeys/crud';
import { AiProvider } from '@/services/aiService/types';
import { getAvailableProviders, getBestAvailableProvider } from '@/services/providerAvailabilityService';

export function OutlineGenerator() {
  const { state, dispatch, setAdditionalInstructions } = useContentBuilder();
  const { 
    mainKeyword, 
    selectedKeywords,
    serpSelections,
    contentTitle,
    additionalInstructions
  } = state;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [customInstructions, setCustomInstructions] = useState(additionalInstructions || '');
  const [aiProvider, setAiProvider] = useState<AiProvider>('openrouter');
  const [availableProviders, setAvailableProviders] = useState<AiProvider[]>([]);
  
  // Load available providers and default AI provider preference
  useEffect(() => {
    const initProviders = async () => {
      const providers = await getAvailableProviders();
      setAvailableProviders(providers);
      
      // Set default provider from preferences or best available
      const defaultProvider = getUserPreference('defaultAiProvider') as AiProvider;
      if (defaultProvider && providers.includes(defaultProvider)) {
        setAiProvider(defaultProvider);
      } else {
        const bestProvider = await getBestAvailableProvider();
        if (bestProvider) {
          setAiProvider(bestProvider);
        }
      }
    };
    
    initProviders();
  }, []);
  
  const selectedItems = serpSelections.filter(item => item.selected);
  const totalSelectedItems = selectedItems.length;

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
      
      // Make sure the selected provider has a key configured
      const keyExists = await hasApiKey(aiProvider);
      if (!keyExists) {
        toast.error(`No API key configured for ${aiProvider}. Please add your API key in Settings.`);
        setIsGenerating(false);
        return;
      }
      
      const result = await generateOutlineWithFallback(outlinePrompt, aiProvider);
      
      if (!result.success) {
        toast.error(result.error || "Failed to generate outline");
        return;
      }
      
      processOutlineResult(result.outlineText);
      
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
  
  const processOutlineResult = (outlineText: string) => {
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
    
    // Update the outline in state
    dispatch({ type: 'SET_OUTLINE', payload: outlineArray });
    
    // Set a title if none exists
    if (!contentTitle) {
      const suggestedTitle = `Complete Guide to ${mainKeyword}: Everything You Need to Know`;
      dispatch({ type: 'SET_CONTENT_TITLE', payload: suggestedTitle });
    }
    
    // Mark the outline step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
    
    toast.success(`AI outline generated with ${outlineArray.length} sections`);
  };
  
  const handleSaveInstructions = () => {
    setAdditionalInstructions(customInstructions);
    toast.success("Instructions saved");
  };

  return (
    <Card className="border-neon-purple/20 bg-gradient-to-br from-indigo-950/20 to-black/30">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-gradient-to-r from-neon-purple to-neon-blue p-2.5 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">AI Outline Generator</h3>
            <p className="text-sm text-white/70">
              Generate a structured outline based on your research
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
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
    </Card>
  );
}
