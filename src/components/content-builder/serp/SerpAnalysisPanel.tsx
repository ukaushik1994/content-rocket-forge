
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { useNavigate } from 'react-router-dom';

// Import the needed SERP components directly from src/components/content/serp-analysis
// instead of trying to use relative paths
import { SerpKeywordsSection } from '@/components/content/serp-analysis/SerpKeywordsSection';
import { SerpQuestionsSection } from '@/components/content/serp-analysis/SerpQuestionsSection';
import { SerpHeadingsSection } from '@/components/content/serp-analysis/SerpHeadingsSection';
import { SerpEntitiesSection } from '@/components/content/serp-analysis/SerpEntitiesSection';
import { SerpContentGapsSection } from '@/components/content/serp-analysis/SerpContentGapsSection';
import { SerpCompetitorsSection } from '@/components/content/serp-analysis/SerpCompetitorsSection';
import { SerpNoDataFound } from '@/components/content/serp-analysis/SerpNoDataFound';
import { SerpEmptyState } from '@/components/content/serp-analysis/SerpEmptyState';

interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent: (content: string, type: string) => void;
  onRetry?: () => void;
}

export const SerpAnalysisPanel: React.FC<SerpAnalysisPanelProps> = ({
  serpData,
  isLoading,
  mainKeyword,
  onAddToContent,
  onRetry
}) => {
  const [activeTab, setActiveTab] = useState<string>('keywords');
  const navigate = useNavigate();
  
  console.log("SerpAnalysisPanel - serpData:", serpData);
  console.log("SerpAnalysisPanel - isLoading:", isLoading);
  
  // Helper to check if data exists for a tab
  const hasTabData = (tabName: string): boolean => {
    if (!serpData) return false;
    
    switch (tabName) {
      case 'keywords':
        return !!(serpData.keywords?.length > 0 || serpData.relatedSearches?.length > 0 || serpData.relatedKeywords?.length > 0);
      case 'questions':
        return !!(serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0);
      case 'headings':
        return !!(serpData.headings && serpData.headings.length > 0);
      case 'entities':
        return !!(serpData.entities && serpData.entities.length > 0);
      case 'content-gaps':
        return !!(serpData.contentGaps && serpData.contentGaps.length > 0);
      case 'competitors':
        return !!(serpData.topResults && serpData.topResults.length > 0);
      default:
        return false;
    }
  };
  
  if (isLoading) {
    return (
      <Card className="h-full flex flex-col justify-center items-center p-12">
        <Loader2 className="h-10 w-10 text-primary animate-spin opacity-70" />
        <p className="mt-4 text-muted-foreground text-sm">
          Analyzing "{mainKeyword}"...
        </p>
      </Card>
    );
  }
  
  if (!serpData) {
    return (
      <SerpNoDataFound onAddApiKey={() => navigate('/settings/api')} onRetry={onRetry} />
    );
  }
  
  if (Object.keys(serpData).length === 0) {
    return (
      <SerpEmptyState 
        keyword={mainKeyword}
        onAddApiKey={() => navigate('/settings/api')}
      />
    );
  }
  
  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="border-b border-border bg-gradient-to-r from-muted/50 to-transparent">
        <CardTitle className="text-md flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2"></span>
          Search Analysis for "{mainKeyword}"
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="p-3 border-b border-border">
          <Tabs 
            defaultValue="keywords" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full h-auto p-0.5 bg-muted/30">
              <TabsTrigger 
                value="keywords"
                className="data-[state=active]:bg-accent"
                disabled={!hasTabData('keywords')}
              >
                Keywords
              </TabsTrigger>
              <TabsTrigger 
                value="questions"
                className="data-[state=active]:bg-accent"
                disabled={!hasTabData('questions')}
              >
                Questions
              </TabsTrigger>
              <TabsTrigger 
                value="headings"
                className="data-[state=active]:bg-accent"
                disabled={!hasTabData('headings')}
              >
                Headings
              </TabsTrigger>
              <TabsTrigger 
                value="entities"
                className="data-[state=active]:bg-accent"
                disabled={!hasTabData('entities')}
              >
                Entities
              </TabsTrigger>
              <TabsTrigger 
                value="content-gaps"
                className="data-[state=active]:bg-accent"
                disabled={!hasTabData('content-gaps')}
              >
                Content Gaps
              </TabsTrigger>
              <TabsTrigger 
                value="competitors"
                className="data-[state=active]:bg-accent"
                disabled={!hasTabData('competitors')}
              >
                Top Results
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'keywords' && (
            <SerpKeywordsSection 
              serpData={serpData}
              expanded={true} 
              onAddToContent={onAddToContent}
            />
          )}
          
          {activeTab === 'questions' && (
            <SerpQuestionsSection 
              serpData={serpData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          )}
          
          {activeTab === 'headings' && (
            <SerpHeadingsSection 
              serpData={serpData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          )}
          
          {activeTab === 'entities' && (
            <SerpEntitiesSection 
              serpData={serpData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          )}
          
          {activeTab === 'content-gaps' && (
            <SerpContentGapsSection 
              serpData={serpData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          )}
          
          {activeTab === 'competitors' && (
            <SerpCompetitorsSection 
              serpData={serpData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
