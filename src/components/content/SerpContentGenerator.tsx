
import React, { useState } from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { ContentTemplatesHeader } from './templates/ContentTemplatesHeader';
import { ContentTemplatesGrid } from './templates/ContentTemplatesGrid';
import { ContentStrategyTips } from './templates/ContentStrategyTips';
import { EmptyState } from './templates/EmptyState';
import { RefreshButton } from '@/components/ui/refresh-button';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';

interface SerpContentGeneratorProps {
  serpData: SerpAnalysisResult | null;
  onGenerateContent: (template: string) => void;
  mainKeyword: string;
}

export function SerpContentGenerator({ 
  serpData, 
  onGenerateContent,
  mainKeyword
}: SerpContentGeneratorProps) {
  const [isRefreshingKeywords, setIsRefreshingKeywords] = useState(false);
  const [isRefreshingHeadings, setIsRefreshingHeadings] = useState(false);
  const [isRefreshingQuestions, setIsRefreshingQuestions] = useState(false);
  const [isRefreshingEntities, setIsRefreshingEntities] = useState(false);
  const [localSerpData, setLocalSerpData] = useState<SerpAnalysisResult | null>(serpData);

  if (!serpData) {
    return <EmptyState message="No SERP data available. Please add your API key in settings and analyze a keyword." />;
  }

  const refreshSection = async (section: 'keywords' | 'headings' | 'questions' | 'entities') => {
    if (!mainKeyword) return;

    // Set the appropriate loading state
    switch(section) {
      case 'keywords':
        setIsRefreshingKeywords(true);
        break;
      case 'headings':
        setIsRefreshingHeadings(true);
        break;
      case 'questions':
        setIsRefreshingQuestions(true);
        break;
      case 'entities':
        setIsRefreshingEntities(true);
        break;
    }

    try {
      // Fetch new SERP data with refresh flag set to true
      const newSerpData = await analyzeKeywordSerp(mainKeyword, true);
      
      if (newSerpData) {
        // Create updated data by merging the new section data with existing data
        const updatedData = { ...localSerpData } as SerpAnalysisResult;
        
        switch(section) {
          case 'keywords':
            updatedData.keywords = newSerpData.keywords;
            updatedData.relatedSearches = newSerpData.relatedSearches;
            toast.success('Keywords refreshed successfully');
            break;
          case 'headings':
            updatedData.headings = newSerpData.headings;
            toast.success('Headings refreshed successfully');
            break;
          case 'questions':
            updatedData.peopleAlsoAsk = newSerpData.peopleAlsoAsk;
            toast.success('Questions refreshed successfully');
            break;
          case 'entities':
            updatedData.entities = newSerpData.entities;
            toast.success('Entities refreshed successfully');
            break;
        }
        
        // Update the local state
        setLocalSerpData(updatedData);
      }
    } catch (error) {
      console.error(`Error refreshing ${section}:`, error);
      toast.error(`Failed to refresh ${section}. Please try again.`);
    } finally {
      // Reset the loading state
      switch(section) {
        case 'keywords':
          setIsRefreshingKeywords(false);
          break;
        case 'headings':
          setIsRefreshingHeadings(false);
          break;
        case 'questions':
          setIsRefreshingQuestions(false);
          break;
        case 'entities':
          setIsRefreshingEntities(false);
          break;
      }
    }
  };

  // Use localSerpData if available, otherwise use the prop
  const displayData = localSerpData || serpData;

  return (
    <div className="space-y-8">
      <ContentTemplatesHeader />
      
      <ContentTemplatesGrid 
        serpData={displayData}
        onGenerateContent={onGenerateContent}
        mainKeyword={mainKeyword}
        onRefreshSection={refreshSection}
        isRefreshingKeywords={isRefreshingKeywords}
        isRefreshingHeadings={isRefreshingHeadings}
        isRefreshingQuestions={isRefreshingQuestions}
        isRefreshingEntities={isRefreshingEntities}
      />
      
      <ContentStrategyTips />
    </div>
  );
}
