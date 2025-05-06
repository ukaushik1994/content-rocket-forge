
import { useState, useEffect, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { getImprovementType, generateRewrittenContent } from '@/utils/seo/contentRewriter';

/**
 * Custom hook for content rewriting functionality
 */
export const useContentRewriter = () => {
  const { state, setContent, dispatch } = useContentBuilder();
  const { content, mainKeyword, seoImprovements = [] } = state;
  
  const [showRewriteDialog, setShowRewriteDialog] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [rewriteType, setRewriteType] = useState<string>('');
  const [rewrittenContent, setRewrittenContent] = useState<string>('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [currentRecommendationId, setCurrentRecommendationId] = useState<string | null>(null);
  
  // Check if a recommendation has been applied - memoized
  const isRecommendationApplied = useCallback((recommendationId: string) => {
    if (!seoImprovements || seoImprovements.length === 0) return false;
    
    return seoImprovements.some(improvement => 
      improvement.id === recommendationId && improvement.applied
    );
  }, [seoImprovements]);
  
  // Handle rewrite content - memoized to prevent recreations that cause re-renders
  const handleRewriteContent = useCallback((recommendation: string, recommendationId: string) => {
    // First check if already applied to avoid unnecessary processing
    if (isRecommendationApplied(recommendationId)) {
      toast.info("This recommendation has already been applied");
      return;
    }
    
    console.log("[useContentRewriter] Handling content rewrite:", { recommendation, recommendationId });
    
    setSelectedRecommendation(recommendation);
    setCurrentRecommendationId(recommendationId);
    const improvementType = getImprovementType(recommendation);
    
    let type = 'general';
    if (improvementType === 'keyword') type = 'keyword optimization';
    if (improvementType === 'readability') type = 'readability';
    if (improvementType === 'structure') type = 'structure';
    
    setRewriteType(type);
    
    // Generate rewritten content preview based on recommendation
    setShowRewriteDialog(true);
    handleGenerateRewrittenContent(recommendation, type);
  }, [isRecommendationApplied]);
  
  // Generate rewritten content preview with cancellation control
  const handleGenerateRewrittenContent = useCallback((recommendation: string, type: string) => {
    if (!content) {
      toast.error("No content available to rewrite");
      return;
    }
    
    setIsRewriting(true);
    setRewrittenContent(''); // Clear previous content
    
    // Use AbortController to handle potential cancelation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      try {
        const newContent = generateRewrittenContent(content, recommendation, type, mainKeyword);
        if (controller.signal.aborted) return;
        
        console.log("[useContentRewriter] Generated rewritten content");
        setRewrittenContent(newContent);
      } catch (error) {
        console.error('Error generating content rewrite:', error);
        if (!controller.signal.aborted) {
          toast.error('Failed to rewrite content');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsRewriting(false);
        }
      }
    }, 1500);
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [content, mainKeyword]);
  
  // Apply rewritten content - memoized
  const applyRewrittenContent = useCallback(() => {
    if (!rewrittenContent || !currentRecommendationId) {
      console.warn("[useContentRewriter] Cannot apply rewritten content - missing content or recommendation ID");
      return;
    }
    
    // Apply the rewritten content
    console.log("[useContentRewriter] Applying rewritten content for recommendation:", currentRecommendationId);
    setContent(rewrittenContent);
    
    // Mark the improvement as applied in state
    dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: currentRecommendationId });
    
    toast.success(`Content optimized for ${rewriteType}`);
    
    // Close the dialog
    setShowRewriteDialog(false);
  }, [rewrittenContent, currentRecommendationId, setContent, dispatch, rewriteType]);
  
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
