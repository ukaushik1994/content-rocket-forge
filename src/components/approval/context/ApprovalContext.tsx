
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { contentAnalysisService } from '@/services/contentAnalysisService';

interface InterLinkingSuggestion {
  sourceContent: ContentItemType;
  targetContent: ContentItemType;
  relevanceScore: number;
  suggestedAnchorText: string;
}

interface ApprovalContextType {
  interLinkingSuggestions: InterLinkingSuggestion[];
  findInterLinkingOpportunities: (content: ContentItemType) => void;
  improveContentWithAI: (content: ContentItemType) => Promise<string | null>;
  isImproving: boolean;
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

export const ApprovalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interLinkingSuggestions, setInterLinkingSuggestions] = useState<InterLinkingSuggestion[]>([]);
  const [isImproving, setIsImproving] = useState(false);
  const { contentItems } = useContent();
  
  const findInterLinkingOpportunities = useCallback((content: ContentItemType) => {
    // Filter out the current content and get only published content
    const otherPublishedContent = contentItems.filter(item => 
      item.id !== content.id && item.status === 'published'
    );
    
    if (otherPublishedContent.length === 0) {
      setInterLinkingSuggestions([]);
      return;
    }
    
    // Simple algorithm to find potential interlinking opportunities
    // In a real app, this would use more sophisticated NLP techniques
    const suggestions: InterLinkingSuggestion[] = [];
    
    // Extract keywords from the content
    const contentKeywords = content.keywords || [];
    
    otherPublishedContent.forEach(targetContent => {
      const targetKeywords = targetContent.keywords || [];
      
      // Check for keyword overlap
      const matchingKeywords = contentKeywords.filter(keyword => 
        targetKeywords.includes(keyword)
      );
      
      if (matchingKeywords.length > 0) {
        // Calculate a simple relevance score based on keyword overlap
        const relevanceScore = (matchingKeywords.length / contentKeywords.length) * 100;
        
        suggestions.push({
          sourceContent: content,
          targetContent,
          relevanceScore,
          suggestedAnchorText: targetContent.title
        });
      }
    });
    
    // Sort by relevance score
    const sortedSuggestions = suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
    setInterLinkingSuggestions(sortedSuggestions);
    
  }, [contentItems]);
  
  const improveContentWithAI = async (content: ContentItemType): Promise<string | null> => {
    setIsImproving(true);
    
    try {
      // In a real app, this would call an AI service to improve the content
      // For now, we'll simulate it with a timeout
      
      // Extract keywords for better context
      const keywords = content.keywords?.join(', ') || '';
      
      // This would be replaced with an actual API call to an AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate improved content by adding some AI-enhanced language
      const improvedContent = `# ${content.title}\n\n${content.content}\n\n## Additional Information\n\nThis section was enhanced by our AI assistant to improve SEO ranking for keywords: ${keywords}.\n\nThe content now includes additional context and more natural keyword usage to boost search engine visibility while maintaining readability.`;
      
      return improvedContent;
    } catch (error) {
      console.error('Error improving content:', error);
      toast.error('Failed to improve content with AI');
      return null;
    } finally {
      setIsImproving(false);
    }
  };
  
  return (
    <ApprovalContext.Provider value={{
      interLinkingSuggestions,
      findInterLinkingOpportunities,
      improveContentWithAI,
      isImproving
    }}>
      {children}
    </ApprovalContext.Provider>
  );
};

export const useApproval = () => {
  const context = useContext(ApprovalContext);
  if (context === undefined) {
    throw new Error('useApproval must be used within an ApprovalProvider');
  }
  return context;
};
