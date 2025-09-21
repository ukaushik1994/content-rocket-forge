
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { analyzeKeywordSerp, SerpAnalysisResult } from '@/services/serpApiService';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';

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
      const keyword = content.metadata?.mainKeyword || content.keywords?.[0] || '';
      const serpSummary = serpData ? JSON.stringify({ top_results: serpData.topResults?.slice(0,3) || [] }) : '';

      const systemPrompt = 'You are an expert editor. Rewrite the content to be clearer, more concise, and SEO-friendly. Integrate important insights from the SERP summary when helpful. Maintain tone, fix grammar, improve structure, and do not hallucinate facts.';
      const userPrompt = `Main keyword: ${keyword}\nSERP context: ${serpSummary}\n\nRewrite and improve this content:\n\n${content.content}`;

      const result = await AIServiceController.generate('content_generation', systemPrompt, userPrompt, { temperature: 0.4, maxTokens: 1800 });
      
      if (result?.content) {
        setIsImproving(false);
        return result.content;
      }
      
      setIsImproving(false);
      return null;
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
      const keyword = content.metadata?.mainKeyword || content.keywords?.[0] || 'this topic';
      const systemPrompt = 'You are an SEO expert. Generate 5 compelling, SEO-optimized title suggestions that would rank well and attract clicks. Respond with a JSON array of strings only.';
      const userPrompt = `Generate 5 title suggestions for content about "${keyword}". Current title: "${content.title}". Content preview: ${content.content?.substring(0, 300)}...`;

      const result = await AIServiceController.generate('title_generation', systemPrompt, userPrompt, { temperature: 0.7, maxTokens: 300 });
      
      if (result?.content) {
        try {
          const suggestions = JSON.parse(result.content);
          if (Array.isArray(suggestions)) {
            return suggestions.slice(0, 5);
          }
        } catch (parseError) {
          // If JSON parsing fails, try to extract titles from text
          const lines = result.content.split('\n').filter(line => line.trim().length > 0);
          return lines.slice(0, 5).map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim());
        }
      }

      // Fallback suggestions
      return [
        `The Ultimate Guide to ${keyword}`,
        `How to Master ${keyword} in 2025`,
        `${keyword}: A Comprehensive Analysis`,
        `Top Strategies for ${keyword} Success`,
        `Everything You Need to Know About ${keyword}`
      ];
    } catch (error) {
      console.error('Error generating title suggestions:', error);
      return [];
    }
  };

  const generateMetadata = async (content: ContentItemType) => {
    try {
      const keyword = content.metadata?.mainKeyword || content.keywords?.[0] || 'this topic';
      const systemPrompt = 'You are an SEO expert. Generate optimized meta title and description for search engines. Respond with JSON in format: {"title": "...", "description": "..."}. Title max 60 chars, description max 160 chars.';
      const userPrompt = `Generate SEO meta title and description for content about "${keyword}". Current title: "${content.title}". Content preview: ${content.content?.substring(0, 400)}...`;

      const result = await AIServiceController.generate('content_generation', systemPrompt, userPrompt, { temperature: 0.3, maxTokens: 200 });
      
      if (result?.content) {
        try {
          const metadata = JSON.parse(result.content);
          if (metadata.title && metadata.description) {
            return {
              title: metadata.title.substring(0, 60),
              description: metadata.description.substring(0, 160)
            };
          }
        } catch (parseError) {
          console.warn('Failed to parse metadata JSON, using fallback');
        }
      }

      // Fallback metadata
      return {
        title: `${content.title} - Complete Guide`,
        description: `Learn all about ${keyword} with our comprehensive guide. Expert insights, strategies, and actionable tips.`
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
