
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OverviewTab } from '../../final-review/tabs/OverviewTab';
import { OptimizeTab } from '../../final-review/tabs/OptimizeTab';
import { SeoTabContent } from '../../final-review/tabs/SeoTabContent';
import { TechnicalTabContent } from '../../final-review/tabs/TechnicalTabContent';

interface OptimizeReviewTabsProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
  state: any;
  isAnalyzing: boolean;
  isGeneratingTitles: boolean;
  keywordUsage: { keyword: string; count: number; density: string }[];
  titleSuggestions: string[];
  serpData: any;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onGenerateMeta: () => void;
  onGenerateTitleSuggestions: () => void;
  onAnalyze: () => void;
  checklistItems: any[];
  onRunAllChecks: () => void;
  completionPercentage: number;
}

export const OptimizeReviewTabs: React.FC<OptimizeReviewTabsProps> = ({
  activeTab,
  handleTabChange,
  state,
  isAnalyzing,
  isGeneratingTitles,
  keywordUsage,
  titleSuggestions,
  serpData,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onGenerateMeta,
  onGenerateTitleSuggestions,
  onAnalyze,
  checklistItems,
  onRunAllChecks,
  completionPercentage
}) => {
  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="mb-2 w-full gap-4 h-auto p-1 bg-transparent">
        <TabsTrigger 
          value="overview"
          className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="optimize"
          className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
        >
          Optimize
        </TabsTrigger>
        <TabsTrigger 
          value="seo"
          className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
        >
          SEO
        </TabsTrigger>
        <TabsTrigger 
          value="technical"
          className="data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none"
        >
          Technical
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <OverviewTab
          content={state.content}
          checklistItems={checklistItems}
          onRunAllChecks={onRunAllChecks}
          metaTitle={state.metaTitle}
          metaDescription={state.metaDescription}
          onMetaTitleChange={onMetaTitleChange}
          onMetaDescriptionChange={onMetaDescriptionChange}
          onGenerateMeta={onGenerateMeta}
          solutionIntegrationMetrics={state.solutionIntegrationMetrics}
          selectedSolution={state.selectedSolution}
          isAnalyzing={isAnalyzing}
          onAnalyze={onAnalyze}
        />
      </TabsContent>
      
      <TabsContent value="optimize">
        <OptimizeTab
          keywordUsage={keywordUsage}
          mainKeyword={state.mainKeyword}
          selectedKeywords={state.selectedKeywords}
          metaTitle={state.metaTitle}
          metaDescription={state.metaDescription}
          onMetaTitleChange={onMetaTitleChange}
          onMetaDescriptionChange={onMetaDescriptionChange}
          onGenerateMeta={onGenerateMeta}
          solutionIntegrationMetrics={state.solutionIntegrationMetrics}
          selectedSolution={state.selectedSolution}
          isAnalyzing={isAnalyzing}
          onAnalyze={onAnalyze}
          titleSuggestions={titleSuggestions}
          isGeneratingTitles={isGeneratingTitles}
          onGenerateTitleSuggestions={onGenerateTitleSuggestions}
          completionPercentage={completionPercentage}
        />
      </TabsContent>
      
      <TabsContent value="seo">
        <SeoTabContent 
          keywordUsage={keywordUsage}
          mainKeyword={state.mainKeyword}
          selectedKeywords={state.selectedKeywords}
          metaTitle={state.metaTitle}
          metaDescription={state.metaDescription}
          onMetaTitleChange={onMetaTitleChange}
          onMetaDescriptionChange={onMetaDescriptionChange}
          onGenerateMeta={onGenerateMeta}
          solutionIntegrationMetrics={state.solutionIntegrationMetrics}
          selectedSolution={state.selectedSolution}
          isAnalyzing={isAnalyzing}
          onAnalyze={onAnalyze}
          titleSuggestions={titleSuggestions}
          isGeneratingTitles={isGeneratingTitles}
          onGenerateTitleSuggestions={onGenerateTitleSuggestions}
        />
      </TabsContent>
      
      <TabsContent value="technical">
        <TechnicalTabContent
          documentStructure={state.documentStructure}
          metaTitle={state.metaTitle}
          metaDescription={state.metaDescription}
          serpData={serpData}
        />
      </TabsContent>
    </Tabs>
  );
};
