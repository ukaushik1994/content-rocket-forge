
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { sendChatRequest } from '@/services/aiService';
import { AIInstructionsInput } from '../AIInstructionsInput';
import { AIGenerateButton } from '../AIGenerateButton';
import { AiProviderSelector } from './AiProviderSelector';
import { getUserPreference } from '@/services/userPreferencesService';
import { getApiKey } from '@/services/apiKeyService';
import { AiProvider } from '@/services/aiService/types';

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
  const [aiProvider, setAiProvider] = useState<AiProvider>('gemini');
  const [availableProviders, setAvailableProviders] = useState<AiProvider[]>([]);
  
  // Load available providers and default AI provider preference
  useEffect(() => {
    const checkAvailableProviders = async () => {
      const providers: AiProvider[] = [];
      
      // Check which providers have API keys configured
      const openaiKey = await getApiKey('openai');
      const anthropicKey = await getApiKey('anthropic');
      const geminiKey = await getApiKey('gemini');
      const mistralKey = await getApiKey('mistral');
      
      if (openaiKey) providers.push('openai');
      if (anthropicKey) providers.push('anthropic');
      if (geminiKey) providers.push('gemini');
      if (mistralKey) providers.push('mistral');
      
      setAvailableProviders(providers);
      
      // Set default provider from preferences or first available
      const defaultProvider = getUserPreference('defaultAiProvider') as AiProvider;
      if (defaultProvider && providers.includes(defaultProvider)) {
        setAiProvider(defaultProvider);
      } else if (providers.length > 0 && !providers.includes(aiProvider)) {
        setAiProvider(providers[0]);
      }
    };
    
    checkAvailableProviders();
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
        customInstructions,
        contentTitle
      );
      
      console.info("AI Generation prompt:", outlinePrompt);
      
      // Make sure the selected provider has a key configured
      const hasApiKey = await getApiKey(aiProvider);
      if (!hasApiKey) {
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
    selectedItems: Array<{type: string, content: string, selected: boolean, source?: string}>,
    customInstructions: string,
    contentTitle?: string
  ) => {
    // Group items by type for better organization in the prompt
    const itemsByType = {
      keyword: selectedItems.filter(item => item.type === 'keyword'),
      question: selectedItems.filter(item => item.type === 'question'),
      entity: selectedItems.filter(item => item.type === 'entity'),
      heading: selectedItems.filter(item => item.type === 'heading'),
      contentGap: selectedItems.filter(item => item.type === 'contentGap'),
      topRank: selectedItems.filter(item => item.type === 'topRank')
    };
    
    // Format items by type for the prompt
    const formatItemsByType = (items: any[], type: string) => {
      if (items.length === 0) return '';
      
      return `
      ${type.toUpperCase()} (${items.length}):
      ${items.map(item => `- ${item.content}`).join('\n')}
      `;
    };
    
    // Create the formatted sections for each content type
    const keywordsText = formatItemsByType(itemsByType.keyword, 'Keywords');
    const questionsText = formatItemsByType(itemsByType.question, 'Questions');
    const entitiesText = formatItemsByType(itemsByType.entity, 'Entities');
    const headingsText = formatItemsByType(itemsByType.heading, 'Headings from top content');
    const contentGapsText = formatItemsByType(itemsByType.contentGap, 'Content Gaps');
    const topRanksText = formatItemsByType(itemsByType.topRank, 'Top Ranking Content');
    
    // Combine all selections into a comprehensive prompt
    const selectedItemsText = `
    ${keywordsText}
    ${questionsText}
    ${entitiesText}
    ${headingsText}
    ${contentGapsText}
    ${topRanksText}
    `.trim();
    
    const secondaryKeywordsText = selectedKeywords.length > 0 ? selectedKeywords.join(', ') : 'None specified';
    
    // Create a title-focused prompt if a content title exists
    const titleFocusedPrompt = contentTitle ? 
      `Create a well-structured outline for an article with the title: "${contentTitle}".
      The outline should directly support this title while addressing the main keyword "${mainKeyword}".`
      : 
      `Create a detailed content outline for an article about "${mainKeyword}".`;
    
    return `
    ${titleFocusedPrompt}
    
    Primary keyword: ${mainKeyword}
    Secondary keywords: ${secondaryKeywordsText}
    
    I've researched the topic and gathered these key points to include:
    ${selectedItemsText}
    
    ${customInstructions ? `Additional instructions: ${customInstructions}` : ''}
    
    Please generate a well-structured outline with these requirements:
    1. Include at least 5-7 main sections with descriptive headings
    2. Format the outline with clear hierarchy
    3. Focus on covering the topic comprehensively
    4. Ensure all selected keywords are addressed
    5. Structure the outline to directly support the ${contentTitle ? `title: "${contentTitle}"` : `topic: "${mainKeyword}"`}
    6. Incorporate the selected questions as headings where appropriate
    7. Address the content gaps identified in the research
    8. Integrate the entities in a logical flow
    9. Optimize for search intent and reader value
    
    Return ONLY the outline in this exact format:
    1. [First Section Title]
    2. [Second Section Title]
    3. [Third Section Title]
    (and so on)
    `;
  };
  
  const generateOutlineWithFallback = async (prompt: string, primaryProvider: AiProvider) => {
    // Check if fallback is enabled
    const enableFallback = getUserPreference('enableAiFallback') === true;
    
    // Try with primary provider first
    try {
      const chatResponse = await sendChatRequest(primaryProvider, {
        messages: [
          { role: 'system', content: 'You are an expert content outline creator who integrates research insights into well-structured outlines that directly address the main topic and support the article title. Your outlines should incorporate user-selected items like keywords, questions, and content gaps.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });
      
      // If we got a valid response
      if (chatResponse?.choices?.[0]?.message?.content) {
        return {
          success: true,
          outlineText: chatResponse.choices[0].message.content
        };
      }
    } catch (error) {
      console.error(`Error with ${primaryProvider}:`, error);
    }
    
    // If we get here, the primary provider failed and we need to try fallbacks
    if (enableFallback) {
      // Find other available providers that are different from the primary
      const fallbackProviders = availableProviders.filter(p => p !== primaryProvider);
      
      // Try each available fallback provider
      for (const fallbackProvider of fallbackProviders) {
        try {
          console.log(`Primary provider ${primaryProvider} failed, trying fallback provider ${fallbackProvider}`);
          
          const fallbackResponse = await sendChatRequest(fallbackProvider, {
            messages: [
              { role: 'system', content: 'You are an expert content outline creator who integrates research insights into well-structured outlines that directly address the main topic and support the article title. Your outlines should incorporate user-selected items like keywords, questions, and content gaps.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7
          });
          
          if (fallbackResponse?.choices?.[0]?.message?.content) {
            toast.info(`Using ${fallbackProvider} as fallback provider`);
            return {
              success: true,
              outlineText: fallbackResponse.choices[0].message.content
            };
          }
        } catch (fallbackError) {
          console.error(`Fallback provider ${fallbackProvider} also failed:`, fallbackError);
        }
      }
    }
    
    // All providers failed or fallback is disabled
    return {
      success: false,
      error: enableFallback
        ? `All configured AI providers failed. Please check your API keys in Settings.`
        : `${primaryProvider} API call failed. Enable AI Provider Fallback in Settings or try another provider.`
    };
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
          {/* AI Provider Selection */}
          <AiProviderSelector 
            aiProvider={aiProvider}
            setAiProvider={setAiProvider}
            availableProviders={availableProviders}
          />
          
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
