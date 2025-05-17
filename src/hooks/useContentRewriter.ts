
import { useState } from 'react';
import { toast } from 'sonner';
import { getRewriteInstructions, getImprovementType } from '@/utils/seo/contentRewriter';

export const useContentRewriter = () => {
  const [showRewriteDialog, setShowRewriteDialog] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [rewriteType, setRewriteType] = useState('');
  const [rewrittenContent, setRewrittenContent] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [sectionToRewrite, setSectionToRewrite] = useState<string>('');
  const [appliedRecommendations, setAppliedRecommendations] = useState<string[]>([]);

  const handleRewriteContent = (recommendation: string, id: string) => {
    setSelectedRecommendation(recommendation);
    const type = getImprovementType(recommendation);
    setRewriteType(type);
    setShowRewriteDialog(true);
    setSectionToRewrite(''); // Reset section content
  };

  const rewriteSection = async (section: string) => {
    if (!selectedRecommendation || isRewriting) return;
    
    setIsRewriting(true);
    setSectionToRewrite(section);
    
    try {
      // In a real application, this would call an AI service
      // For now, we'll simulate the rewriting with a timeout
      const type = getImprovementType(selectedRecommendation);
      const instructions = getRewriteInstructions(type, selectedRecommendation);
      
      console.log('Rewriting content with instructions:', instructions);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate faux improved content for demo purposes
      const improvedContent = `${section}\n\n[This content has been optimized for ${type}]`;
      setRewrittenContent(improvedContent);
      
    } catch (error) {
      console.error('Error rewriting content:', error);
      toast.error('Failed to rewrite content. Please try again.');
    } finally {
      setIsRewriting(false);
    }
  };

  const applyRewrittenContent = () => {
    if (selectedRecommendation) {
      if (!appliedRecommendations.includes(selectedRecommendation)) {
        setAppliedRecommendations([...appliedRecommendations, selectedRecommendation]);
      }
      
      // Close the dialog after applying
      setShowRewriteDialog(false);
      
      // Reset states
      setRewrittenContent('');
      toast.success('Content optimized successfully!');
    }
  };

  const isRecommendationApplied = (id: string) => {
    return appliedRecommendations.includes(id);
  };

  return {
    showRewriteDialog,
    selectedRecommendation,
    rewriteType,
    rewrittenContent,
    isRewriting,
    sectionToRewrite,
    setSectionToRewrite,
    handleRewriteContent,
    applyRewrittenContent,
    rewriteSection,
    setShowRewriteDialog,
    isRecommendationApplied
  };
};
