
import { useState, useEffect, useCallback, useRef } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { getImprovementType } from '@/utils/seo/contentRewriter';

const REWRITE_TIMEOUT = 12000; // 12 seconds timeout for generating content

/**
 * Enhanced hook for content rewriting with improved error handling and recovery options
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
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [rewriteStartTime, setRewriteStartTime] = useState<number | null>(null);
  
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
  
  // Handle rewrite content with improved error handling
  const handleRewriteContent = useCallback((recommendation: string, recommendationId: string) => {
    // Reset error state
    setRewriteError(null);
    
    // First check if already applied to avoid unnecessary processing
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
      setRewriteError("No content available to rewrite");
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
    setRewriteStartTime(Date.now());
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Content rewriting timed out')), REWRITE_TIMEOUT);
      });
      
      // Create the content generation promise that checks for abort signals
      const contentPromise = new Promise<string>(async (resolve, reject) => {
        try {
          // Import the function dynamically to reduce initial load time
          const { generateRewrittenContent } = await import('@/utils/seo/contentRewriter');
          
          // Check if aborted during import
          if (signal.aborted) {
            reject(new Error('Operation cancelled'));
            return;
          }
          
          // Generate content
          const newContent = generateRewrittenContent(content, recommendation, type, mainKeyword);
          
          // Add artificial delay to prevent flashing for very fast operations
          await new Promise(resolve => setTimeout(resolve, 500));
          
          resolve(newContent);
        } catch (error) {
          console.error('Error in content generation:', error);
          reject(error);
        }
      });
      
      // Race the content generation against the timeout
      const newContent = await Promise.race([contentPromise, timeoutPromise]);
      
      // Check if operation was aborted
      if (!signal.aborted) {
        setRewrittenContent(newContent);
      }
    } catch (error) {
      console.error('Error generating content rewrite:', error);
      
      if (!signal.aborted) {
        const errorMessage = error.message || 'Failed to rewrite content';
        setRewriteError(errorMessage);
        
        if (errorMessage.includes('timed out')) {
          toast.error('Content rewrite operation timed out. Try again or skip this recommendation.');
        } else {
          toast.error(`Rewrite error: ${errorMessage}`);
        }
      }
    } finally {
      if (!signal.aborted) {
        setIsRewriting(false);
      }
    }
  }, [content, mainKeyword]);
  
  // Monitor rewrite duration for potentially stuck processes
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    
    if (isRewriting && rewriteStartTime) {
      timer = setTimeout(() => {
        // If rewriting is still running after 10 seconds, show a warning
        if (isRewriting) {
          setRewriteError("Operation is taking longer than expected. You can wait or cancel.");
        }
      }, 10000); // 10 seconds
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRewriting, rewriteStartTime]);
  
  // Apply rewritten content - memoized
  const applyRewrittenContent = useCallback(() => {
    if (!rewrittenContent || !currentRecommendationId) {
      setRewriteError("Cannot apply rewritten content - missing content or recommendation ID");
      return;
    }
    
    // Apply the rewritten content
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
    setRewriteError(null);
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
    isRecommendationApplied,
    rewriteError
  };
};
