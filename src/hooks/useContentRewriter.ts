
import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { getImprovementType, generateRewrittenContent } from '@/utils/seo/contentRewriter';

/**
 * Custom hook for content rewriting functionality
 */
export const useContentRewriter = () => {
  const { state, setContent, dispatch } = useContentBuilder();
  const { content, mainKeyword } = state;
  
  const [showRewriteDialog, setShowRewriteDialog] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [rewriteType, setRewriteType] = useState<string>('');
  const [rewrittenContent, setRewrittenContent] = useState<string>('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [currentRecommendationId, setCurrentRecommendationId] = useState<string | null>(null);
  
  // Check if a recommendation has been applied
  const isRecommendationApplied = (recommendationId: string) => {
    if (!state.seoImprovements) return false;
    
    return state.seoImprovements.some(improvement => 
      improvement.id === recommendationId && improvement.applied
    );
  };
  
  // Handle rewrite content
  const handleRewriteContent = (recommendation: string, recommendationId: string) => {
    if (isRecommendationApplied(recommendationId)) {
      toast.info("This recommendation has already been applied");
      return;
    }
    
    setSelectedRecommendation(recommendation);
    setCurrentRecommendationId(recommendationId);
    const improvementType = getImprovementType(recommendation);
    
    let type = 'general';
    if (improvementType === 'keyword') type = 'keyword optimization';
    if (improvementType === 'readability') type = 'readability';
    if (improvementType === 'structure') type = 'structure';
    
    setRewriteType(type);
    
    // Generate rewritten content preview based on recommendation
    handleGenerateRewrittenContent(recommendation, type);
    
    setShowRewriteDialog(true);
  };
  
  // Generate rewritten content preview
  const handleGenerateRewrittenContent = (recommendation: string, type: string) => {
    if (!content) return;
    
    setIsRewriting(true);
    
    try {
      // Simulate API call with setTimeout
      setTimeout(() => {
        const newContent = generateRewrittenContent(content, recommendation, type, mainKeyword);
        setRewrittenContent(newContent);
        setIsRewriting(false);
      }, 1500);
    } catch (error) {
      console.error('Error generating content rewrite:', error);
      setIsRewriting(false);
      toast.error('Failed to rewrite content');
    }
  };
  
  // Apply rewritten content
  const applyRewrittenContent = () => {
    if (!rewrittenContent || !currentRecommendationId) return;
    
    // Apply the rewritten content
    setContent(rewrittenContent);
    
    // Mark the improvement as applied in state
    dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: currentRecommendationId });
    
    toast.success(`Content optimized for ${rewriteType}`);
    
    // Close the dialog
    setShowRewriteDialog(false);
  };
  
  return {
    showRewriteDialog,
    selectedRecommendation,
    rewriteType,
    rewrittenContent,
    isRewriting,
    handleRewriteContent,
    applyRewrittenContent,
    setShowRewriteDialog,
    isRecommendationApplied
  };
};
