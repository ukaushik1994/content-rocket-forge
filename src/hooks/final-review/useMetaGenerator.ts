
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { generateMetaSuggestions } from '@/utils/seo/documentAnalysis';
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
  const generateMeta = () => {
    if (!content) {
      toast.error('No content available to generate meta information', toastConfig.error);
      return;
    }
    
    const { metaTitle: generatedTitle, metaDescription: generatedDescription } = generateMetaSuggestions(content, mainKeyword, contentTitle);
    
    console.log("[useMetaGenerator] Generating meta:", { generatedTitle, generatedDescription });
    
    // Update both meta title and content title for consistency
    dispatch({ type: 'SET_META_TITLE', payload: generatedTitle });
    dispatch({ type: 'SET_CONTENT_TITLE', payload: generatedTitle });
    dispatch({ type: 'SET_META_DESCRIPTION', payload: generatedDescription });
    
    toast.success('Generated meta title and description', toastConfig.success);
    
    // Also generate title suggestions
    onGenerateTitles();
  };

  return {
    generateMeta
  };
};
