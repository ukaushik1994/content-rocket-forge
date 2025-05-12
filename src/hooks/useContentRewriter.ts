
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { SeoImprovement } from '@/contexts/content-builder/types/seo-types';

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
  
  // Handle rewrite content button click
  const handleRewriteContent = useCallback((recommendation: string, id: string) => {
    setSelectedRecommendation(recommendation);
    setSelectedRecommendationId(id);
    
    // Determine rewrite type based on recommendation text
    let type = 'content';
    if (recommendation.toLowerCase().includes('keyword')) {
      type = 'keyword';
    } else if (recommendation.toLowerCase().includes('heading')) {
      type = 'heading';
    }
    setRewriteType(type);
    
    // Generate improved content
    generateRewrittenContent(recommendation, type);
    
    // Show dialog
    setShowRewriteDialog(true);
  }, []);
  
  // Generate improved content based on recommendation
  const generateRewrittenContent = useCallback((recommendation: string, type: string) => {
    setIsRewriting(true);
    
    // In a real implementation, this would call an AI service
    console.log(`Generating improved ${type} content based on recommendation:`, recommendation);
    
    // For now, simulate API call with a delay
    setTimeout(() => {
      let newContent = content;
      
      try {
        // Simplified implementation for demo purposes
        if (type === 'keyword') {
          // For keyword issues, add the missing keywords
          const missingKeyword = recommendation.match(/include ["']([^"']+)["']/)?.[1] || 'key topic';
          newContent = addKeywordToContent(content, missingKeyword);
        } else if (type === 'heading') {
          // For heading issues, improve headings
          newContent = improveHeadings(content);
        } else {
          // For general content issues, improve readability
          newContent = improveContent(content, recommendation);
        }
        
        setRewrittenContent(newContent);
        
        // Add improvement if not exists
        if (!seoImprovements.some(imp => imp.id === selectedRecommendationId)) {
          // Fix: Use a type-safe literal for impact instead of a generic string
          const newImprovement: SeoImprovement = {
            id: selectedRecommendationId || uuidv4(),
            type,
            recommendation,
            impact: "high", // Use the literal type: "high", "medium", or "low"
            applied: false
          };
          
          dispatch({ type: 'ADD_SEO_IMPROVEMENT', payload: newImprovement });
        }
      } catch (error) {
        console.error('Error generating rewritten content:', error);
        toast.error('Failed to generate improved content. Please try again.');
        setRewrittenContent(content); // Fallback to original content
      } finally {
        setIsRewriting(false);
      }
    }, 1500); // Simulated delay
  }, [content, selectedRecommendationId, dispatch, seoImprovements]);
  
  // Apply the rewritten content and mark improvement as applied
  const applyRewrittenContent = useCallback(() => {
    console.log('Applying rewritten content...');
    
    // Update content in context
    if (setContent) {
      setContent(rewrittenContent);
    } else {
      // Fallback if setContent not available
      dispatch({ type: 'SET_CONTENT', payload: rewrittenContent });
    }
    
    // Mark the improvement as applied if it exists
    if (selectedRecommendationId) {
      dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: selectedRecommendationId });
    }
    
    // Close the dialog
    setShowRewriteDialog(false);
    
    // Reset states
    setSelectedRecommendation('');
    setRewriteType('');
    
    // If we've applied improvements, ensure that the step can be completed
    const updatedImprovements = state.seoImprovements.map(improvement => 
      improvement.id === selectedRecommendationId 
        ? { ...improvement, applied: true } 
        : improvement
    );
    
    const appliedCount = updatedImprovements.filter(imp => imp.applied).length;
    const totalCount = updatedImprovements.length;
    
    // If we've applied enough improvements (60% or at least 3), mark the step as completed
    if (appliedCount >= Math.max(3, Math.ceil(totalCount * 0.6))) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    }
    
    // Show success notification
    toast.success('Content optimization applied');
  }, [rewrittenContent, selectedRecommendationId, dispatch, setContent, state.seoImprovements]);
  
  // Check if a recommendation has been applied
  const isRecommendationApplied = useCallback((id: string) => {
    return state.seoImprovements.some(imp => imp.id === id && imp.applied);
  }, [state.seoImprovements]);
  
  // Force complete the optimization step
  const forceCompleteOptimization = useCallback(() => {
    console.log('Force completing optimization step...');
    
    // Mark step as analyzed and completed
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    
    toast.success('Optimization step completed. Moving to final review.');
  }, [dispatch]);
  
  // Helper functions for content modification
  const addKeywordToContent = (originalContent: string, keyword: string): string => {
    const paragraphs = originalContent.split('\n\n');
    
    // Add keyword to first paragraph if it doesn't contain it
    if (!paragraphs[0].toLowerCase().includes(keyword.toLowerCase())) {
      paragraphs[0] += ` This addresses ${keyword} in a comprehensive way.`;
    }
    
    return paragraphs.join('\n\n');
  };
  
  const improveHeadings = (originalContent: string): string => {
    const lines = originalContent.split('\n');
    
    // Simple implementation: add a "#" to lines that seem like they should be headings
    return lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.length > 0 && 
          trimmed.length < 60 && 
          !trimmed.startsWith('#') && 
          !trimmed.endsWith('.') &&
          !trimmed.includes(':')) {
        return `## ${trimmed}`;
      }
      return line;
    }).join('\n');
  };
  
  const improveContent = (originalContent: string, recommendation: string): string => {
    // Simple example: add a paragraph addressing the recommendation
    const paragraphs = originalContent.split('\n\n');
    
    // Add a paragraph after the first one
    paragraphs.splice(1, 0, `To address a key aspect: ${recommendation.replace('Consider', 'We have improved')}.`);
    
    return paragraphs.join('\n\n');
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
    isRecommendationApplied,
    forceCompleteOptimization
  };
};
