
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { analyzeKeywordSerp, SerpAnalysisResult } from '@/services/serpApiService';
import { toast } from 'sonner';

interface ApprovalContextType {
  improveContentWithAI: (content: ContentItemType) => Promise<string | null>;
  isImproving: boolean;
  serpData: SerpAnalysisResult | null;
  isFetchingSerp: boolean;
  fetchSerpData: (keyword: string) => Promise<void>;
  findInterLinkingOpportunities: (content: ContentItemType) => void;
  generateTitleSuggestions: (content: ContentItemType) => Promise<string[]>;
  generateMetadata: (content: ContentItemType) => Promise<{title: string, description: string}>;
}

const ApprovalContext = createContext<ApprovalContextType>({
  improveContentWithAI: async () => null,
  isImproving: false,
  serpData: null,
  isFetchingSerp: false,
  fetchSerpData: async () => {},
  findInterLinkingOpportunities: () => {},
  generateTitleSuggestions: async () => [],
  generateMetadata: async () => ({title: '', description: ''}),
});

export const ApprovalProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isImproving, setIsImproving] = useState(false);
  const [serpData, setSerpData] = useState<SerpAnalysisResult | null>(null);
  const [isFetchingSerp, setIsFetchingSerp] = useState(false);

  const improveContentWithAI = async (content: ContentItemType): Promise<string | null> => {
    setIsImproving(true);
    
    try {
      // This would connect to an AI service in a real app
      // For now we'll just simulate an improvement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here we'd send the content to an AI service and get improved content back
      const improvedContent = content.content || '';
      
      setIsImproving(false);
      return improvedContent;
    } catch (error) {
      console.error('Error improving content with AI:', error);
      setIsImproving(false);
      return null;
    }
  };

  const fetchSerpData = useCallback(async (keyword: string) => {
    if (!keyword) return;
    setIsFetchingSerp(true);
    try {
      const data = await analyzeKeywordSerp(keyword);
      setSerpData(data);
    } catch (error) {
      console.error('Error fetching SERP data:', error);
      toast.error('Failed to fetch SERP data');
    } finally {
      setIsFetchingSerp(false);
    }
  }, []);
  const findInterLinkingOpportunities = useCallback((content: ContentItemType) => {
    // This would analyze the content and find other content to link to
    console.log('Finding interlinking opportunities for:', content.title);
    // Implementation would be added in a real app
  }, []);

  const generateTitleSuggestions = async (content: ContentItemType): Promise<string[]> => {
    try {
      // This would connect to an AI service in a real app
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const keyword = content.metadata?.mainKeyword || content.keywords?.[0] || '';
      
      return [
        `The Ultimate Guide to ${keyword}`,
        `How to Master ${keyword} in 2025`,
        `${keyword}: A Comprehensive Analysis`,
        `Top 10 Strategies for ${keyword} Success`,
        `Everything You Need to Know About ${keyword}`
      ];
    } catch (error) {
      console.error('Error generating title suggestions:', error);
      return [];
    }
  };

  const generateMetadata = async (content: ContentItemType) => {
    try {
      // This would connect to an AI service in a real app
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const keyword = content.metadata?.mainKeyword || content.keywords?.[0] || 'this topic';
      
      return {
        title: `${content.title} - SEO Optimized Title`,
        description: `Learn all about ${keyword} with our comprehensive guide. Covers key aspects and strategies.`
      };
    } catch (error) {
      console.error('Error generating metadata:', error);
      return {title: '', description: ''};
    }
  };

  const value = {
    improveContentWithAI,
    isImproving,
    serpData,
    isFetchingSerp,
    fetchSerpData,
    findInterLinkingOpportunities,
    generateTitleSuggestions,
    generateMetadata,
  };

  return (
    <ApprovalContext.Provider value={value}>
      {children}
    </ApprovalContext.Provider>
  );
};

export const useApproval = () => useContext(ApprovalContext);
