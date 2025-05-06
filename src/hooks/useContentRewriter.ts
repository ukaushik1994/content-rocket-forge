
import React, { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { getImprovementType, getRewriteInstructions } from '@/utils/seo/contentRewriter';

/**
 * Custom hook for content rewriting functionality
 */
export const useContentRewriter = () => {
  const { state, dispatch, setContent } = useContentBuilder();
  const { content, seoImprovements } = state;
  
  const [showRewriteDialog, setShowRewriteDialog] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState('');
  const [selectedRecommendationId, setSelectedRecommendationId] = useState('');
  const [rewriteType, setRewriteType] = useState('');
  const [rewrittenContent, setRewrittenContent] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  
  // Mock function to simulate AI rewriting content
  const simulateContentRewrite = async (content: string, instructions: string) => {
    // In a real implementation, this would call an AI service
    // For now we'll just simulate some improvements to the content
    
    setIsRewriting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let improved = content;
      
      // Simulate different improvements based on recommendation type
      switch (rewriteType) {
        case 'keyword':
          // Add some keyword mentions
          const keywordMatch = instructions.match(/keyword "([^"]+)"/i);
          const keyword = keywordMatch ? keywordMatch[1] : '';
          if (keyword) {
            improved = `${keyword} - ${improved}`;
            improved = improved.replace(/\.$/, `. This relates to ${keyword}.`);
          }
          break;
          
        case 'heading':
          // Add some headings
          const paragraphs = improved.split('\n\n');
          if (paragraphs.length >= 2) {
            improved = `# ${paragraphs[0].trim()}\n\n` + 
                      paragraphs.slice(1).map(p => p.trim()).join('\n\n');
            
            // Add subheadings if content is long enough
            if (paragraphs.length >= 4) {
              const midIndex = Math.floor(paragraphs.length / 2);
              improved = improved.split('\n\n').map((p, i) => {
                if (i === midIndex) return `\n\n## Additional Information\n\n${p}`;
                return p;
              }).join('\n\n');
            }
          }
          break;
          
        case 'content':
        case 'readability':
          // Break up long paragraphs
          improved = improved.split('\n\n').map(p => {
            if (p.length > 300) {
              const midPoint = Math.floor(p.length / 2);
              const breakPoint = p.indexOf('. ', midPoint);
              if (breakPoint !== -1) {
                return p.substring(0, breakPoint + 1) + '\n\n' + p.substring(breakPoint + 2);
              }
            }
            return p;
          }).join('\n\n');
          break;
          
        case 'length':
          // Add a conclusion paragraph
          improved = improved + '\n\n' + "In conclusion, this content demonstrates the key points discussed above. It's important to consider all aspects of this topic for a comprehensive understanding.";
          break;
      }
      
      setRewrittenContent(improved);
    } catch (error) {
      console.error('Error rewriting content:', error);
      toast.error('Failed to generate optimized content');
      setRewrittenContent(content); // Use original content as fallback
    } finally {
      setIsRewriting(false);
    }
  };
  
  // Handle rewriting content based on a recommendation
  const handleRewriteContent = useCallback((recommendation: string, id: string) => {
    // Skip if already rewriting
    if (isRewriting) return;
    
    // Set selected recommendation
    setSelectedRecommendation(recommendation);
    setSelectedRecommendationId(id);
    
    // Determine rewrite type
    const type = getImprovementType(recommendation);
    setRewriteType(type);
    
    // Get rewrite instructions
    const instructions = getRewriteInstructions(type, recommendation);
    
    // Show dialog
    setShowRewriteDialog(true);
    
    // Start rewriting process
    simulateContentRewrite(content, instructions);
  }, [content, isRewriting]);
  
  // Apply the rewritten content and mark improvement as applied
  const applyRewrittenContent = useCallback(() => {
    // Update content in context
    if (setContent) {
      setContent(rewrittenContent);
    } else {
      // Fallback if setContent not available
      dispatch({ type: 'SET_CONTENT', payload: rewrittenContent });
    }
    
    // Mark recommendation as applied
    if (selectedRecommendationId) {
      dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: selectedRecommendationId });
      
      // Check if this is the last improvement or if enough improvements have been applied
      const totalImprovements = state.seoImprovements.length;
      const appliedImprovements = state.seoImprovements.filter(imp => imp.applied).length + 1; // +1 for current
      
      // Mark step as completed if more than 60% of improvements are applied or at least 3
      if (appliedImprovements >= Math.max(3, Math.ceil(totalImprovements * 0.6))) {
        dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
      }
    }
    
    // Close dialog
    setShowRewriteDialog(false);
    
    // Show success notification
    toast.success('Content optimization applied');
  }, [rewrittenContent, selectedRecommendationId, dispatch, setContent, state.seoImprovements]);
  
  // Check if a recommendation has been applied
  const isRecommendationApplied = useCallback((id: string) => {
    if (!seoImprovements) return false;
    const improvement = seoImprovements.find(item => item.id === id);
    return improvement ? improvement.applied : false;
  }, [seoImprovements]);
  
  // Force complete the optimization step
  const forceCompleteOptimization = useCallback(() => {
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    toast.success('Optimization step marked as completed');
  }, [dispatch]);
  
  return {
    showRewriteDialog,
    selectedRecommendation,
    rewriteType,
    rewrittenContent,
    isRewriting,
    handleRewriteContent,
    applyRewrittenContent,
    setShowRewriteDialog,
    isRecommendationApplied,
    forceCompleteOptimization
  };
};
