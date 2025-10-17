
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { generateMetaSuggestions } from '@/utils/seo/meta/generateMetaSuggestions';
import AIServiceController from '@/services/aiService/AIServiceController';
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
      console.log("[useMetaGenerator] Starting meta generation with AI");
      
      // First try to use AI service to generate meta information
      const metaResponse = await AIServiceController.generate(
        'title_generation',
        'You are an expert SEO specialist. Generate a compelling meta title (max 60 characters) and meta description (max 160 characters) that are SEO-optimized and include the main keyword naturally.',
        `Content Title: ${contentTitle || 'Untitled'}
Main Keyword: ${mainKeyword}

Content excerpt: ${content.substring(0, 1000)}...

Please generate:
1. Meta Title: [60 characters max, include main keyword naturally]
2. Meta Description: [160 characters max, compelling and includes main keyword]

Format your response as:
Meta Title: [your title here]
Meta Description: [your description here]`,
        { temperature: 0.7, maxTokens: 500 }
      );

      if (metaResponse?.content) {
        const aiResponse = metaResponse.content;
        console.log("[useMetaGenerator] AI response:", aiResponse);
        
        // Parse the AI response to extract meta title and description
        let generatedTitle = '';
        let generatedDescription = '';
        
        // Try to find meta title in the response
        const titleMatch = aiResponse.match(/(?:Meta Title:|Title:)\s*(.*?)(?:\n|$)/i);
        if (titleMatch && titleMatch[1]) {
          generatedTitle = titleMatch[1].trim().replace(/^["']|["']$/g, '');
        }
        
        // Try to find meta description in the response
        const descMatch = aiResponse.match(/(?:Meta Description:|Description:)\s*(.*?)(?:\n|$)/i);
        if (descMatch && descMatch[1]) {
          generatedDescription = descMatch[1].trim().replace(/^["']|["']$/g, '');
        }
        
        // If we couldn't parse the AI response, use the utility function as fallback
        if (!generatedTitle || !generatedDescription) {
          console.log("[useMetaGenerator] Couldn't parse AI response, using fallback");
          const fallback = generateMetaSuggestions(content, mainKeyword, contentTitle);
          generatedTitle = generatedTitle || fallback.metaTitle;
          generatedDescription = generatedDescription || fallback.metaDescription;
        }
        
        // Ensure title and description don't exceed character limits
        if (generatedTitle.length > 60) {
          generatedTitle = generatedTitle.substring(0, 57) + '...';
        }
        if (generatedDescription.length > 160) {
          generatedDescription = generatedDescription.substring(0, 157) + '...';
        }
        
        console.log("[useMetaGenerator] Generated meta:", { generatedTitle, generatedDescription });
        
        // Update only meta fields, not content title
        dispatch({ type: 'SET_META_TITLE', payload: generatedTitle });
        dispatch({ type: 'SET_META_DESCRIPTION', payload: generatedDescription });
        
        toast.success('Generated meta title and description using AI', toastConfig.success);
      } else {
        // Fallback to the utility function if AI service fails
        const { metaTitle: generatedTitle, metaDescription: generatedDescription } = generateMetaSuggestions(content, mainKeyword, contentTitle);
        
        dispatch({ type: 'SET_META_TITLE', payload: generatedTitle });
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
