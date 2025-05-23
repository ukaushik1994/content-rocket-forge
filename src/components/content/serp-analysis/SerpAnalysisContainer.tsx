
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';
import { SerpAnalysisHeader } from './SerpAnalysisHeader';
import { SerpAnalysisSections } from './SerpAnalysisSections';
import { SerpEmptyState, SerpNoDataFound } from './index';

export interface SerpAnalysisContainerProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
  onRetry?: () => void;
  onSerpDataChange?: (data: SerpAnalysisResult | null) => void;
}

export function SerpAnalysisContainer({ 
  serpData: initialSerpData, 
  isLoading: initialIsLoading, 
  mainKeyword,
  onAddToContent = () => {},
  onRetry = () => {},
  onSerpDataChange = () => {}
}: SerpAnalysisContainerProps) {
  const [internalSerpData, setInternalSerpData] = useState<SerpAnalysisResult | null>(initialSerpData);
  const [internalIsLoading, setInternalIsLoading] = useState<boolean>(initialIsLoading);
  
  // Effect to sync props with internal state
  useEffect(() => {
    setInternalSerpData(initialSerpData);
    setInternalIsLoading(initialIsLoading);
  }, [initialSerpData, initialIsLoading]);
  
  // Effect to fetch SERP data when the mainKeyword changes
  useEffect(() => {
    if (mainKeyword && !internalSerpData && !internalIsLoading) {
      fetchSerpData();
    }
  }, [mainKeyword]);
  
  const fetchSerpData = async () => {
    if (!mainKeyword) return;
    
    setInternalIsLoading(true);
    
    try {
      const result = await analyzeKeywordSerp(mainKeyword);
      setInternalSerpData(result);
      onSerpDataChange(result);
      
      if (result) {
        console.log("SERP data fetched successfully:", result);
        if (result.isMockData) {
          toast.warning("Using mock data. Add your API key in settings for real results.");
        } else {
          toast.success("Search analysis completed successfully.");
        }
      } else {
        console.error("No SERP data returned");
        toast.error("Failed to retrieve search data. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching SERP data:", error);
      toast.error("Failed to analyze keyword. Please check your API key and try again.");
    } finally {
      setInternalIsLoading(false);
    }
  };
  
  const handleRetry = () => {
    fetchSerpData();
    onRetry();
  };
  
  if (internalIsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary h-8 w-8 animate-pulse" />
          </div>
          <p className="mt-6 text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">Analyzing search results...</p>
          <p className="text-sm text-muted-foreground mt-2">Extracting insights from top-ranking content</p>
        </div>
      </div>
    );
  }

  if (internalSerpData === null && mainKeyword) {
    return <SerpNoDataFound mainKeyword={mainKeyword} onRetry={handleRetry} />;
  }

  if (!internalSerpData) {
    return <SerpEmptyState />;
  }

  return (
    <div className="space-y-8">
      <SerpAnalysisHeader serpData={internalSerpData} mainKeyword={mainKeyword} />
      <SerpAnalysisSections serpData={internalSerpData} onAddToContent={onAddToContent} />
    </div>
  );
}
