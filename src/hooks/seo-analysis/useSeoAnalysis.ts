import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { sendChatRequest } from '@/services/aiService';
import { SeoImprovement } from '@/contexts/content-builder/types';

export const useSeoAnalysis = () => {
  const { state, dispatch } = useContentBuilder();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const analyzeSeoContent = useCallback(async (content: string) => {
    if (!content || content.trim().length === 0) {
      toast.error('No content to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await sendChatRequest('openai', {
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert. Analyze the provided content and suggest improvements for better search engine optimization.'
          },
          {
            role: 'user',
            content: `Analyze this content for SEO improvements:

CONTENT:
${content}

MAIN KEYWORD: ${state.mainKeyword || 'Not specified'}
SELECTED KEYWORDS: ${state.selectedKeywords?.join(', ') || 'None'}

Provide specific, actionable SEO improvement suggestions in JSON format:
{
  "seoScore": number (0-100),
  "improvements": [
    {
      "id": "unique_id",
      "title": "Improvement Title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "category": "keywords|structure|content|meta",
      "applied": false
    }
  ]
}`
          }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        const jsonMatch = response.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          setAnalysisResults(result);
          
          // Update state with SEO improvements
          if (result.improvements) {
            dispatch({ type: 'SET_SEO_IMPROVEMENTS', payload: result.improvements });
          }
          if (result.seoScore) {
            dispatch({ type: 'SET_SEO_SCORE', payload: result.seoScore });
          }
          
          toast.success('SEO analysis completed');
          return result;
        }
      }
      
      toast.error('Failed to analyze content for SEO');
      return null;
    } catch (error) {
      console.error('SEO analysis error:', error);
      toast.error('Failed to analyze content for SEO');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [state.mainKeyword, state.selectedKeywords, dispatch]);

  const applySeoImprovement = useCallback((improvementId: string) => {
    dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: improvementId });
    toast.success('SEO improvement applied');
  }, [dispatch]);

  const skipSeoOptimization = useCallback(() => {
    dispatch({ type: 'SKIP_SEO_OPTIMIZATION' });
    toast.info('SEO optimization skipped');
  }, [dispatch]);

  return {
    isAnalyzing,
    analysisResults,
    analyzeSeoContent,
    applySeoImprovement,
    skipSeoOptimization,
    seoScore: state.seoScore,
    seoImprovements: state.seoImprovements
  };
};
