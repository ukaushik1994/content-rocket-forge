
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { sendChatRequest } from '@/services/aiService';
import { ContentBuilderState } from '@/contexts/content-builder/types';
import { getUserPreference, getBrandGuidelines } from '@/services/userPreferencesService';
import { getApiKey } from '@/services/apiKeyService';

type AiProvider = 'openai' | 'anthropic' | 'gemini';

export function useContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProvider, setAiProvider] = useState<AiProvider>('openai');
  const [availableProviders, setAvailableProviders] = useState<AiProvider[]>([]);

  // Load available providers and the default AI provider from user preferences
  useEffect(() => {
    const loadProviders = async () => {
      const providers: AiProvider[] = [];
      
      // Check which providers have API keys configured
      const openaiKey = await getApiKey('openai');
      const anthropicKey = await getApiKey('anthropic');
      const geminiKey = await getApiKey('gemini');
      
      if (openaiKey) providers.push('openai');
      if (anthropicKey) providers.push('anthropic');
      if (geminiKey) providers.push('gemini');
      
      setAvailableProviders(providers);
      
      // Set default provider from preferences or first available
      const defaultProvider = getUserPreference('defaultAiProvider');
      if (defaultProvider && providers.includes(defaultProvider)) {
        setAiProvider(defaultProvider);
      } else if (providers.length > 0) {
        setAiProvider(providers[0]);
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
      selectedKeywords 
    } = state;
    
    if (!mainKeyword) {
      toast.error("Please set a main keyword first");
      return false;
    }
    
    // Make sure the selected provider has a key configured
    const hasApiKey = await getApiKey(aiProvider);
    if (!hasApiKey) {
      toast.error(`No API key configured for ${aiProvider}. Please add your API key in Settings.`);
      return false;
    }
    
    setIsGenerating(true);
    
    try {
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
      
      // Get brand guidelines
      const brandGuidelines = getBrandGuidelines();
      let brandGuidelinesText = '';
      
      if (brandGuidelines) {
        brandGuidelinesText = `
IMPORTANT - BRAND GUIDELINES:
Brand Name: ${brandGuidelines.brandName}
Brand Tone: ${brandGuidelines.brandTone}
Target Audience: ${brandGuidelines.targetAudience}

Key Brand Values:
${brandGuidelines.keyValues.map(value => `- ${value}`).join('\n')}

Do:
${brandGuidelines.doGuidelines.map(guideline => `- ${guideline}`).join('\n')}

Don't:
${brandGuidelines.dontGuidelines.map(guideline => `- ${guideline}`).join('\n')}
${brandGuidelines.companyDescription ? `\nCompany Description: ${brandGuidelines.companyDescription}` : ''}
`;
      }
      
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
      
      ${brandGuidelinesText}
      `;
      
      // Call the AI API via our service
      console.info("AI Content Generation prompt:", prompt);
      
      // Check if fallback is enabled
      const enableFallback = getUserPreference('enableAiFallback') === true;
      
      // Try primary provider first
      try {
        const chatResponse = await sendChatRequest(aiProvider, {
          messages: [
            { role: 'system', content: 'You are an expert content writer specializing in SEO-optimized articles. Create comprehensive, well-structured content that follows the provided outline and incorporates the specified keywords naturally.' + (brandGuidelinesText ? ' Adhere strictly to the brand guidelines provided in the user\'s message.' : '') },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          maxTokens: 4000
        });
        
        if (chatResponse?.choices?.[0]?.message?.content) {
          // Use the AI-generated content
          const generatedContent = chatResponse.choices[0].message.content;
          setContent(generatedContent);
          toast.success('Content generated successfully');
          return true;
        }
      } catch (error) {
        console.error(`Error with primary provider ${aiProvider}:`, error);
      }
      
      // If primary provider failed and fallback is enabled, try other providers
      if (enableFallback) {
        const fallbackProviders = availableProviders.filter(p => p !== aiProvider);
        
        for (const fallbackProvider of fallbackProviders) {
          try {
            console.log(`Primary provider ${aiProvider} failed, trying fallback provider ${fallbackProvider}`);
            
            const fallbackResponse = await sendChatRequest(fallbackProvider, {
              messages: [
                { role: 'system', content: 'You are an expert content writer specializing in SEO-optimized articles. Create comprehensive, well-structured content that follows the provided outline and incorporates the specified keywords naturally.' + (brandGuidelinesText ? ' Adhere strictly to the brand guidelines provided in the user\'s message.' : '') },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7,
              maxTokens: 4000
            });
            
            if (fallbackResponse?.choices?.[0]?.message?.content) {
              // Use the AI-generated content from fallback
              const generatedContent = fallbackResponse.choices[0].message.content;
              setContent(generatedContent);
              toast.success(`Content generated successfully using ${fallbackProvider} as fallback`);
              return true;
            }
          } catch (fallbackError) {
            console.error(`Fallback provider ${fallbackProvider} also failed:`, fallbackError);
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
