
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { analyzeContent, ContentAnalysis } from '@/services/contentAnalysisService';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { generateTitleSuggestions as generateTitles } from '@/utils/seo/titles/generateTitleSuggestions';
import { generateMetaSuggestions } from '@/utils/seo/meta/generateMetaSuggestions';

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
  serpData: any | null;
  isFetchingSerp: boolean;
  fetchSerpData: (keyword: string) => Promise<void>;
  generateTitleSuggestions: (content: ContentItemType) => Promise<string[]>;
  generateMetadata: (content: ContentItemType) => Promise<{ metaTitle: string, metaDescription: string }>;
  regenerateContentSection: (content: ContentItemType, section: string, sectionTitle: string) => Promise<string>;
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

export const ApprovalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interLinkingSuggestions, setInterLinkingSuggestions] = useState<InterLinkingSuggestion[]>([]);
  const [isImproving, setIsImproving] = useState(false);
  const [serpData, setSerpData] = useState<any | null>(null);
  const [isFetchingSerp, setIsFetchingSerp] = useState(false);
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

  const fetchSerpData = async (keyword: string) => {
    if (!keyword) {
      toast.error('No keyword provided for SERP analysis');
      return;
    }

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
  };

  const generateTitleSuggestions = async (content: ContentItemType): Promise<string[]> => {
    try {
      // Extract keywords for title generation
      const mainKeyword = content.keywords && content.keywords.length > 0 
        ? content.keywords[0] 
        : '';
      
      // Generate titles using the utility
      const suggestions = await generateTitles(content.content, mainKeyword, content.keywords || []);
      return suggestions;
    } catch (error) {
      console.error('Error generating title suggestions:', error);
      toast.error('Failed to generate title suggestions');
      // Return some default suggestions
      return [
        `${content.title} - Updated Version`,
        `Comprehensive Guide to ${content.keywords?.[0] || 'This Topic'}`,
        `Everything You Need to Know About ${content.keywords?.[0] || 'This Subject'}`
      ];
    }
  };

  const generateMetadata = async (content: ContentItemType) => {
    try {
      // Extract main keyword
      const mainKeyword = content.keywords && content.keywords.length > 0 
        ? content.keywords[0] 
        : content.title.split(' ').slice(0, 3).join(' ');
      
      // Generate meta suggestions using the utility
      const meta = generateMetaSuggestions(content.content, mainKeyword, content.title);
      return meta;
    } catch (error) {
      console.error('Error generating metadata:', error);
      toast.error('Failed to generate metadata');
      // Return basic metadata
      return {
        metaTitle: content.title,
        metaDescription: content.content.substring(0, 150) + '...'
      };
    }
  };

  const regenerateContentSection = async (
    content: ContentItemType,
    section: string,
    sectionTitle: string
  ): Promise<string> => {
    try {
      // In a real app, this would call an API to regenerate the section
      // For now, we'll simulate the regeneration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Extract keywords for better context
      const keywords = content.keywords?.join(', ') || '';
      
      // Simulate improved section
      if (section.includes('#')) {
        // It's a heading section, preserve the heading
        const headingMatch = section.match(/^(#{1,6})\s+(.+)$/m);
        const headingPrefix = headingMatch ? headingMatch[1] + ' ' : '';
        return `${headingPrefix}${sectionTitle}\n\nThis is an AI-enhanced section about ${sectionTitle}. The content has been improved with better keyword usage and clearer explanations. The main keywords (${keywords}) have been naturally incorporated, and the readability has been enhanced for better user engagement.`;
      } else {
        // It's regular content
        return `This is an AI-enhanced section. The content has been improved with better keyword usage (${keywords}) and clearer explanations. The readability has been enhanced for better user engagement, and the overall flow has been optimized.`;
      }
    } catch (error) {
      console.error('Error regenerating section:', error);
      toast.error('Failed to regenerate content section');
      // Return the original section if regeneration fails
      return section;
    }
  };
  
  return (
    <ApprovalContext.Provider value={{
      interLinkingSuggestions,
      findInterLinkingOpportunities,
      improveContentWithAI,
      isImproving,
      serpData,
      isFetchingSerp,
      fetchSerpData,
      generateTitleSuggestions,
      generateMetadata,
      regenerateContentSection
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
