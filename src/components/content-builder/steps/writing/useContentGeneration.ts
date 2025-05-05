
import { useState } from 'react';
import { toast } from 'sonner';
import { sendChatRequest } from '@/services/aiService';
import { ContentBuilderState } from '@/contexts/content-builder/types';

type AiProvider = 'openai' | 'anthropic' | 'gemini';

export function useContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProvider, setAiProvider] = useState<AiProvider>('openai');

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
      return;
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
        setContent(generatedContent);
        toast.success('Content generated successfully');
        return true;
      } else {
        toast.error('Failed to generate content. Please check your API key configuration or try another provider.');
        return false;
      }
      
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
    generateContent
  };
}
