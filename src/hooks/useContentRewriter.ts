
import { useState, useEffect, useCallback, useRef } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { getImprovementType } from '@/utils/seo/contentRewriter';

const REWRITE_TIMEOUT = 8000; // 8 seconds timeout for generating content

/**
 * Custom hook for content rewriting functionality with improved performance and error handling
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
  
  // Add abort controller ref to cancel operations
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
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
    
    // Show dialog before generating to improve UX
    setShowRewriteDialog(true);
    
    // Small timeout to ensure dialog is shown before starting the heavy operation
    setTimeout(() => {
      generateRewrittenContent(recommendation, type);
    }, 100);
  }, [isRecommendationApplied]);
  
  // Generate rewritten content asynchronously with timeout and cancellation
  const generateRewrittenContent = useCallback(async (recommendation: string, type: string) => {
    if (!content) {
      toast.error("No content available to rewrite");
      setIsRewriting(false);
      return;
    }
    
    // Cancel any existing operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this operation
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    setIsRewriting(true);
    setRewrittenContent(''); // Clear previous content
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Content rewriting timed out')), REWRITE_TIMEOUT);
      });
      
      // Create the content generation promise that checks for abort signals
      const contentPromise = new Promise<string>(async (resolve) => {
        // Import the function dynamically to reduce initial load time
        const { generateRewrittenContent } = await import('@/utils/seo/contentRewriter');
        
        // Check if aborted during import
        if (signal.aborted) {
          return;
        }
        
        try {
          // Generate content
          const newContent = generateRewrittenContent(content, recommendation, type, mainKeyword);
          resolve(newContent);
        } catch (error) {
          console.error('Error in content generation:', error);
          resolve(content); // Fallback to original content
        }
      });
      
      // Race the content generation against the timeout
      const newContent = await Promise.race([contentPromise, timeoutPromise]);
      
      // Check if operation was aborted
      if (!signal.aborted) {
        console.log("[useContentRewriter] Generated rewritten content");
        setRewrittenContent(newContent);
      }
    } catch (error) {
      console.error('Error generating content rewrite:', error);
      
      if (!signal.aborted) {
        toast.error('Content rewrite operation timed out. Try again or skip this recommendation.');
      }
    } finally {
      if (!signal.aborted) {
        setIsRewriting(false);
      }
    }
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
    
    // Clear the abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current = null;
    }
  }, [rewrittenContent, currentRecommendationId, setContent, dispatch, rewriteType]);
  
  // Cancel operation when dialog is closed
  const handleCloseDialog = useCallback(() => {
    if (isRewriting && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsRewriting(false);
    setShowRewriteDialog(false);
  }, [isRewriting]);
  
  return {
    showRewriteDialog,
    selectedRecommendation,
    rewriteType,
    rewrittenContent,
    isRewriting,
    handleRewriteContent,
    applyRewrittenContent,
    setShowRewriteDialog: handleCloseDialog,
    isRecommendationApplied
  };
};
