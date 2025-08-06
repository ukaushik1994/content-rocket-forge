
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { sendChatRequest } from '@/services/aiService';
import { ContentBuilderState, SerpSelection } from '@/contexts/content-builder/types';
import { getUserPreference } from '@/services/userPreferencesService';
import { hasApiKey } from '@/services/apiKeys/crud';
import { getAvailableProviders, getBestAvailableProvider, initializeProviderPreferences } from '@/services/providerAvailabilityService';

type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'lmstudio' | 'openrouter';

export function useContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProvider, setAiProvider] = useState<AiProvider>('openrouter'); // Default to OpenRouter
  const [availableProviders, setAvailableProviders] = useState<AiProvider[]>([]);

  // Load available providers and the default AI provider from user preferences
  useEffect(() => {
    const loadProviders = async () => {
      // Initialize provider preferences (upgrades to OpenRouter if available)
      await initializeProviderPreferences();
      
      // Use the new provider availability service
      const providers = await getAvailableProviders();
      setAvailableProviders(providers);
      
      // Set default provider from preferences or best available (OpenRouter prioritized)
      const defaultProvider = getUserPreference('defaultAiProvider');
      if (defaultProvider && providers.includes(defaultProvider)) {
        setAiProvider(defaultProvider);
      } else {
        const bestProvider = await getBestAvailableProvider();
        if (bestProvider) {
          setAiProvider(bestProvider);
        }
      }
    };
    
    loadProviders();
  }, []);

  const generateContent = async (
    state: ContentBuilderState,
    setContent: (content: string) => void
  ) => {
    const { 
      mainKeyword, 
      outline, 
      additionalInstructions, 
      selectedSolution,
      contentTitle,
      selectedKeywords,
      serpSelections
    } = state;
    
    if (!mainKeyword) {
      toast.error("Please set a main keyword first");
      return false;
    }
    
    // Make sure the selected provider has a key configured
    const keyExists = await hasApiKey(aiProvider);
    if (!keyExists) {
      toast.error(`No API key configured for ${aiProvider}. Please add your API key in Settings.`);
      return false;
    }
    
    setIsGenerating(true);
    
    try {
      // Organize SERP selections by type for better prompt structure
      const serpData = organizeSerpSelections(serpSelections);
      
      // Convert outline to a formatted string for the prompt
      const outlineText = Array.isArray(outline) 
        ? outline.map((item, index) => {
            if (typeof item === 'string') {
              return `${index + 1}. ${item}`;
            } else if (item && typeof item === 'object' && 'title' in item) {
              return `${index + 1}. ${(item as { title: string }).title}`;
            }
            return '';
          }).filter(Boolean).join('\n')
        : '';
        
      // Prepare secondary keywords
      const secondaryKeywords = selectedKeywords?.join(', ') || '';
      
      // Create comprehensive prompt with SERP data
      const prompt = createComprehensivePrompt({
        mainKeyword,
        contentTitle,
        outlineText,
        secondaryKeywords,
        selectedSolution,
        additionalInstructions,
        serpData
      });
      
      // Enhanced system prompt
      const systemPrompt = createEnhancedSystemPrompt();
      
      console.info("AI Content Generation prompt:", prompt);
      
      // Check if fallback is enabled
      const enableFallback = getUserPreference('enableAiFallback') === true;
      
      // Try primary provider first
      try {
        console.log(`🎯 Generating content with ${aiProvider}`);
        const chatResponse = await sendChatRequest(aiProvider, {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          maxTokens: 4000
        });
        
        if (chatResponse?.choices?.[0]?.message?.content) {
          // Use the AI-generated content
          const generatedContent = chatResponse.choices[0].message.content;
          
          // If content doesn't start with the title as an H1, add it
          let finalContent = generatedContent;
          const titleAsH1 = `# ${contentTitle || `Complete Guide to ${mainKeyword}`}`;
          
          if (!finalContent.trim().startsWith('#')) {
            finalContent = `${titleAsH1}\n\n${finalContent}`;
          }
          
          setContent(finalContent);
          toast.success(`Content generated successfully with ${aiProvider}!`);
          return true;
        } else {
          throw new Error('No content generated from API response');
        }
      } catch (error) {
        console.error(`❌ Error with primary provider ${aiProvider}:`, error);
        toast.error(`${aiProvider} failed. ${enableFallback ? 'Trying fallback providers...' : 'Please check your API key or try another provider.'}`);
      }
      
      // If primary provider failed and fallback is enabled, try other providers
      if (enableFallback) {
        const fallbackProviders = availableProviders.filter(p => p !== aiProvider);
        
        for (const fallbackProvider of fallbackProviders) {
          try {
            console.log(`🔄 Primary provider ${aiProvider} failed, trying fallback provider ${fallbackProvider}`);
            
            const fallbackResponse = await sendChatRequest(fallbackProvider, {
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7,
              maxTokens: 4000,
              model: fallbackProvider === 'openrouter' ? 'openai/gpt-3.5-turbo' : undefined
            });
            
            if (fallbackResponse?.choices?.[0]?.message?.content) {
              // Use the AI-generated content from fallback
              const generatedContent = fallbackResponse.choices[0].message.content;
              
              // If content doesn't start with the title as an H1, add it
              let finalContent = generatedContent;
              const titleAsH1 = `# ${contentTitle || `Complete Guide to ${mainKeyword}`}`;
              
              if (!finalContent.trim().startsWith('#')) {
                finalContent = `${titleAsH1}\n\n${finalContent}`;
              }
              
              setContent(finalContent);
              toast.success(`✅ Content generated using ${fallbackProvider} as fallback`);
              return true;
            }
          } catch (fallbackError) {
            console.error(`❌ Fallback provider ${fallbackProvider} also failed:`, fallbackError);
          }
        }
      }
      
      // All providers failed or fallback is disabled
      toast.error(enableFallback
        ? 'All configured AI providers failed. Please check your API keys in Settings.'
        : `${aiProvider} API call failed. Enable AI Provider Fallback in Settings or try another provider.`);
      return false;
      
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again or check your API configuration.');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    aiProvider,
    setAiProvider,
    generateContent,
    availableProviders
  };
}

/**
 * Organize SERP selections by type for better prompt structure
 */
const organizeSerpSelections = (serpSelections: SerpSelection[]) => {
  const selectedItems = serpSelections.filter(item => item.selected);
  
  return {
    keywords: selectedItems.filter(item => item.type === 'keyword').map(item => item.content),
    questions: selectedItems.filter(item => item.type === 'question').map(item => item.content),
    entities: selectedItems.filter(item => item.type === 'entity').map(item => item.content),
    headings: selectedItems.filter(item => item.type === 'heading').map(item => item.content),
    contentGaps: selectedItems.filter(item => item.type === 'contentGap').map(item => item.content),
    topResults: selectedItems.filter(item => item.type === 'topRank').map(item => item.content),
    competitors: selectedItems.filter(item => item.type === 'competitor').map(item => item.content),
    snippets: selectedItems.filter(item => item.type === 'snippet').map(item => item.content)
  };
};

/**
 * Create a comprehensive prompt that includes all available research data
 */
const createComprehensivePrompt = ({
  mainKeyword,
  contentTitle,
  outlineText,
  secondaryKeywords,
  selectedSolution,
  additionalInstructions,
  serpData
}: {
  mainKeyword: string;
  contentTitle: string | null;
  outlineText: string;
  secondaryKeywords: string;
  selectedSolution: any;
  additionalInstructions: string;
  serpData: any;
}) => {
  const title = contentTitle || `Complete Guide to ${mainKeyword}`;
  
  let prompt = `Write comprehensive, helpful content for an article with the title: "${title}".

CONTENT REQUIREMENTS:
- Title: ${title}
- Primary Keyword: ${mainKeyword}
${secondaryKeywords ? `- Secondary Keywords: ${secondaryKeywords}` : ''}

STRUCTURE TO FOLLOW:
The content MUST start with the title as an H1 heading: # ${title}

Then follow this outline structure:
${outlineText}
`;

  // Add SERP research insights if available
  if (serpData.questions.length > 0) {
    prompt += `\nIMPORTANT QUESTIONS TO ADDRESS:
Based on search research, users are asking these questions. Make sure to answer them thoroughly:
${serpData.questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}
`;
  }

  if (serpData.entities.length > 0) {
    prompt += `\nKEY CONCEPTS TO INCLUDE:
These important concepts should be naturally incorporated and explained:
${serpData.entities.map((e: string, i: number) => `- ${e}`).join('\n')}
`;
  }

  if (serpData.contentGaps.length > 0) {
    prompt += `\nCONTENT OPPORTUNITIES:
Address these gaps that competitors are missing:
${serpData.contentGaps.map((gap: string, i: number) => `- ${gap}`).join('\n')}
`;
  }

  if (serpData.keywords.length > 0) {
    prompt += `\nADDITIONAL KEYWORDS TO INCORPORATE:
Naturally include these related keywords where relevant:
${serpData.keywords.join(', ')}
`;
  }

  if (serpData.headings.length > 0) {
    prompt += `\nCOMPETITOR HEADING INSIGHTS:
Consider these heading patterns from top-ranking content:
${serpData.headings.map((h: string, i: number) => `- ${h}`).join('\n')}
`;
  }

  if (selectedSolution) {
    prompt += `\nSOLUTION TO HIGHLIGHT:
Mention the solution "${selectedSolution.name}" and highlight these features: ${selectedSolution.features.slice(0,3).join(', ')}.
`;
  }

  if (additionalInstructions) {
    prompt += `\nADDITIONAL INSTRUCTIONS:
${additionalInstructions}
`;
  }

  prompt += `\nFORMATTING REQUIREMENTS:
- Use Markdown syntax with proper headings (H1, H2, H3, etc.)
- Create engaging, scannable content with bullet points and numbered lists
- Include a compelling introduction that hooks the reader
- Write a strong conclusion that summarizes key takeaways
- Optimize for readability and search engines
- Make the content genuinely helpful and actionable for readers

CONTENT QUALITY FOCUS:
- Answer user questions comprehensively
- Provide practical, actionable advice
- Include relevant examples where helpful
- Ensure accuracy and helpfulness above all else`;

  return prompt;
};

/**
 * Create an enhanced system prompt for better content quality
 */
const createEnhancedSystemPrompt = () => {
  return `You are an expert content writer specializing in creating comprehensive, SEO-optimized articles that genuinely help readers. Your content is:

1. HELPFUL FIRST: Always prioritize providing real value to readers over SEO optimization
2. ACCURATE: Base content on factual information and best practices
3. COMPREHENSIVE: Cover topics thoroughly while remaining focused
4. ACTIONABLE: Provide concrete steps and practical advice readers can implement
5. ENGAGING: Use clear, conversational language that keeps readers interested
6. WELL-STRUCTURED: Follow logical flow with proper headings and formatting

When incorporating research data:
- Answer user questions directly and thoroughly
- Explain concepts and entities clearly for all knowledge levels
- Address content gaps that competitors miss
- Use keywords naturally without keyword stuffing
- Structure content based on proven heading patterns

Always start with the title as an H1 heading and follow the provided outline structure. Focus on creating content that readers will find genuinely useful and that search engines will recognize as high-quality.`;
};
