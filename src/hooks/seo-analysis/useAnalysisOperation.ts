import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { sendChatRequest } from '@/services/aiService';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

export const useAnalysisOperation = () => {
  const { state, dispatch } = useContentBuilder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const performAnalysis = useCallback(async (content: string) => {
    setIsAnalyzing(true);
    try {
      // 1. Document Structure Analysis
      const structure = extractDocumentStructure(content);
      dispatch({ type: 'SET_DOCUMENT_STRUCTURE', payload: structure });

      // 2. SEO Analysis (example - adjust as needed)
      const seoAnalysisResult = await sendChatRequest('openai', {
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO analyst. Analyze the given content and provide a SEO score.'
          },
          {
            role: 'user',
            content: `Analyze the following content for SEO and provide a score (0-100): ${content}`
          }
        ]
      });

      const seoScore = seoAnalysisResult?.choices?.[0]?.message?.content;
      // Assuming the AI returns a simple number as a string
      if (seoScore && !isNaN(Number(seoScore))) {
        dispatch({ type: 'SET_SEO_SCORE', payload: Number(seoScore) });
      } else {
        toast.error('Could not determine SEO score from AI response.');
      }

      toast.success('Content analysis completed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('An error occurred during content analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [dispatch]);

  return {
    isAnalyzing,
    performAnalysis
  };
};
