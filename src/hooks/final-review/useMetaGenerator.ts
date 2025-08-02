import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { generateMetaSuggestions } from '@/utils/seo/meta/generateMetaSuggestions';
import { sendChatRequest } from '@/services/aiService';
import { toast } from 'sonner';

// Standard toast configuration
const toastConfig = {
  success: { duration: 3000, closeButton: true },
  error: { duration: 5000, closeButton: true }
};

/**
 * Custom hook for generating meta information
 */
export const useMetaGenerator = (onGenerateTitles: () => void) => {
  const { state, dispatch } = useContentBuilder();
  const { content, mainKeyword, contentTitle } = state;
  
  // Generate meta information
  const generateMeta = async () => {
    if (!content) {
      toast.error('No content available to generate meta information', toastConfig.error);
      return;
    }
    
    try {
      // First try to use AI service to generate meta information
      const metaResponse = await sendChatRequest('openai', {
        messages: [
          { 
            role: 'system', 
            content: 'You are a specialist in SEO and meta tag generation. Generate a concise meta title and meta description based on the content provided. Meta title should be at most 60 characters. Meta description should be at most 160 characters.'
          },
          { 
            role: 'user', 
            content: `Content Title: ${contentTitle || 'Untitled'}\nMain Keyword: ${mainKeyword}\n\nContent excerpt: ${content.substring(0, 1000)}...\n\nGenerate a meta title (max 60 characters) and meta description (max 160 characters) that are SEO-optimized and include the main keyword.`
          }
        ],
        temperature: 0.7
      });

      if (metaResponse?.choices?.[0]?.message?.content) {
        const aiResponse = metaResponse.choices[0].message.content;
        console.log("[useMetaGenerator] AI response:", aiResponse);
        
        // Parse the AI response to extract meta title and description
        let generatedTitle = '';
        let generatedDescription = '';
        
        // Try to find meta title in the response
        const titleMatch = aiResponse.match(/(?:Meta Title:|Title:)\s*(.*?)(?:\n|$)/i);
        if (titleMatch && titleMatch[1]) {
          generatedTitle = titleMatch[1].trim();
        }
        
        // Try to find meta description in the response
        const descMatch = aiResponse.match(/(?:Meta Description:|Description:)\s*(.*?)(?:\n|$)/i);
        if (descMatch && descMatch[1]) {
          generatedDescription = descMatch[1].trim();
        }
        
        // If we couldn't parse the AI response, use the utility function as fallback
        if (!generatedTitle || !generatedDescription) {
          console.log("[useMetaGenerator] Couldn't parse AI response, using fallback");
          const fallback = generateMetaSuggestions(content, mainKeyword, contentTitle);
          generatedTitle = generatedTitle || fallback.metaTitle;
          generatedDescription = generatedDescription || fallback.metaDescription;
        }
        
        console.log("[useMetaGenerator] Generated meta:", { generatedTitle, generatedDescription });
        
        // Update both meta title and content title for consistency
        dispatch({ type: 'SET_META_TITLE', payload: generatedTitle });
        dispatch({ type: 'SET_CONTENT_TITLE', payload: generatedTitle });
        dispatch({ type: 'SET_META_DESCRIPTION', payload: generatedDescription });
        
        toast.success('Generated meta title and description using AI', toastConfig.success);
      } else {
        // Fallback to the utility function if AI service fails
        const { metaTitle: generatedTitle, metaDescription: generatedDescription } = generateMetaSuggestions(content, mainKeyword, contentTitle);
        
        dispatch({ type: 'SET_META_TITLE', payload: generatedTitle });
        dispatch({ type: 'SET_CONTENT_TITLE', payload: generatedTitle });
        dispatch({ type: 'SET_META_DESCRIPTION', payload: generatedDescription });
        
        toast.success('Generated meta title and description', toastConfig.success);
      }
      
      // Also generate title suggestions
      onGenerateTitles();
      
    } catch (error) {
      console.error("[useMetaGenerator] Error:", error);
      
      // Fallback to the utility function
      const { metaTitle: generatedTitle, metaDescription: generatedDescription } = generateMetaSuggestions(content, mainKeyword, contentTitle);
      
      dispatch({ type: 'SET_META_TITLE', payload: generatedTitle });
      dispatch({ type: 'SET_CONTENT_TITLE', payload: generatedTitle });
      dispatch({ type: 'SET_META_DESCRIPTION', payload: generatedDescription });
      
      toast.success('Generated meta title and description using local algorithm', toastConfig.success);
      
      // Also generate title suggestions
      onGenerateTitles();
    }
  };

  return {
    generateMeta
  };
};
