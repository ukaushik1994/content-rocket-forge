
import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { getImprovementType, generateRewrittenContent } from '@/utils/seo/contentRewriter';

/**
 * Custom hook for content rewriting functionality
 */
export const useContentRewriter = () => {
  const { state, setContent } = useContentBuilder();
  const { content, mainKeyword } = state;
  
  const [showRewriteDialog, setShowRewriteDialog] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [rewriteType, setRewriteType] = useState<string>('');
  const [rewrittenContent, setRewrittenContent] = useState<string>('');
  const [isRewriting, setIsRewriting] = useState(false);
  
  // Handle rewrite content
  const handleRewriteContent = (recommendation: string) => {
    setSelectedRecommendation(recommendation);
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
    if (!rewrittenContent) return;
    
    // Apply the rewritten content
    setContent(rewrittenContent);
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
    setShowRewriteDialog
  };
};
