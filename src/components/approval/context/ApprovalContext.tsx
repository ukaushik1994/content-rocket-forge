
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';
import { analyzeSerpKeyword } from '@/services/serpApiService';
import type { SerpAnalysisResult } from '@/types/serp';
import { 
  generateSeoReport, 
  improveContentWithAI, 
  generateTitleSuggestions,
  generateMetadata 
} from '@/services/aiProcessingService';

export interface ApprovalContextValue {
  // Content state
  content: string;
  setContent: (content: string) => void;
  
  // Keywords
  keywords: string[];
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  
  // SERP analysis data
  serpAnalysisData: Record<string, SerpAnalysisResult | null>;
  analyzeSerpData: (keyword: string) => Promise<void>;
  
  // SEO analysis
  seoScore: number;
  setSeoScore: (score: number) => void;
  seoReport: string;
  generateSeoAnalysis: () => Promise<void>;
  
  // Loading states
  isAnalyzing: boolean;
  isGeneratingReport: boolean;
  
  // Selection state
  selectedKeyword: string | null;
  setSelectedKeyword: (keyword: string | null) => void;
  
  // New properties and methods
  serpData: SerpAnalysisResult | null;
  isFetchingSerp: boolean;
  fetchSerpData: (keyword: string) => Promise<void>;
  improveContentWithAI: (content: any) => Promise<string>;
  isImproving: boolean;
  generateTitleSuggestions: (content: any) => Promise<string[]>;
  generateMetadata: (content: string, keywords: string[]) => Promise<{ metaTitle: string, metaDescription: string }>;
  findInterLinkingOpportunities: (content: any) => void;
}

const ApprovalContext = createContext<ApprovalContextValue | null>(null);

interface ApprovalProviderProps {
  children: React.ReactNode;
  initialContent?: string;
  initialKeywords?: string[];
}

export const ApprovalProvider: React.FC<ApprovalProviderProps> = ({
  children,
  initialContent = '',
  initialKeywords = []
}) => {
  // Content state
  const [content, setContent] = useState<string>(initialContent);
  
  // Keywords state
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  
  // SERP analysis state
  const [serpAnalysisData, setSerpAnalysisData] = useState<Record<string, SerpAnalysisResult | null>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [serpData, setSerpData] = useState<SerpAnalysisResult | null>(null);
  const [isFetchingSerp, setIsFetchingSerp] = useState<boolean>(false);
  
  // AI processing states
  const [isImproving, setIsImproving] = useState<boolean>(false);
  
  // SEO analysis state
  const [seoScore, setSeoScore] = useState<number>(0);
  const [seoReport, setSeoReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  
  // Selection state
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  
  // Add a keyword
  const addKeyword = (keyword: string) => {
    if (!keyword.trim() || keywords.includes(keyword.trim())) return;
    setKeywords([...keywords, keyword.trim()]);
  };
  
  // Remove a keyword
  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
    
    // If the removed keyword was selected, clear the selection
    if (selectedKeyword === keyword) {
      setSelectedKeyword(null);
    }
  };
  
  // Analyze SERP data for a keyword
  const analyzeSerpData = async (keyword: string) => {
    if (!keyword.trim()) return;
    
    // Don't re-analyze if we already have data
    if (serpAnalysisData[keyword] && !isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      const data = await analyzeSerpKeyword(keyword);
      
      // Update the SERP data for this keyword
      setSerpAnalysisData({
        ...serpAnalysisData,
        [keyword]: data
      });
      
    } catch (error: any) {
      console.error('Error analyzing keyword:', error);
      toast.error(`Failed to analyze keyword: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Fetch SERP data for keyword
  const fetchSerpData = async (keyword: string) => {
    if (!keyword || isFetchingSerp) return;
    
    setIsFetchingSerp(true);
    
    try {
      const data = await analyzeSerpKeyword(keyword);
      setSerpData(data);
    } catch (error: any) {
      console.error('Error fetching SERP data:', error);
      toast.error(`Failed to fetch SERP data: ${error.message}`);
      setSerpData(null);
    } finally {
      setIsFetchingSerp(false);
    }
  };
  
  // Generate SEO analysis for the content
  const generateSeoAnalysis = async () => {
    if (!content || keywords.length === 0) {
      toast.error('Content and at least one keyword are required for SEO analysis');
      return;
    }
    
    setIsGeneratingReport(true);
    
    try {
      // Generate the SEO report
      const report = await generateSeoReport(content, keywords);
      
      // Extract the score from the report
      const scoreMatch = report.match(/Score:\s*(\d+)/i);
      const extractedScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
      
      // Set the report and score
      setSeoReport(report);
      setSeoScore(extractedScore);
      
    } catch (error: any) {
      console.error('Error generating SEO report:', error);
      toast.error(`Failed to generate SEO report: ${error.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  // Improve content using AI
  const handleImproveContentWithAI = async (contentData: any) => {
    if (!contentData) return '';
    
    setIsImproving(true);
    try {
      const improved = await improveContentWithAI(contentData);
      return improved;
    } catch (error: any) {
      toast.error(`Failed to improve content: ${error.message}`);
      return contentData.content || '';
    } finally {
      setIsImproving(false);
    }
  };
  
  // Find interlinking opportunities
  const findInterLinkingOpportunities = (contentData: any) => {
    // In a real implementation, this would analyze the content and find opportunities
    // for interlinking with other content items
    console.log('Finding interlinking opportunities for:', contentData?.title);
    // This would be implemented with actual logic in a production environment
  };
  
  const value: ApprovalContextValue = {
    content,
    setContent,
    keywords,
    addKeyword,
    removeKeyword,
    serpAnalysisData,
    analyzeSerpData,
    seoScore,
    setSeoScore,
    seoReport,
    generateSeoAnalysis,
    isAnalyzing,
    isGeneratingReport,
    selectedKeyword,
    setSelectedKeyword,
    // New properties
    serpData,
    isFetchingSerp,
    fetchSerpData,
    improveContentWithAI: handleImproveContentWithAI,
    isImproving,
    generateTitleSuggestions,
    generateMetadata,
    findInterLinkingOpportunities
  };
  
  return (
    <ApprovalContext.Provider value={value}>
      {children}
    </ApprovalContext.Provider>
  );
};

export const useApproval = () => {
  const context = useContext(ApprovalContext);
  if (!context) {
    throw new Error('useApproval must be used within an ApprovalProvider');
  }
  return context;
};
