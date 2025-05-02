
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResearchTabContent from './tabs/ResearchTabContent';
import ClustersTabContent from './tabs/ClustersTabContent'; 
import TrendsTabContent from './tabs/TrendsTabContent';
import SerpTabContent from './tabs/SerpTabContent';
import CompetitorsTabContent from './tabs/CompetitorsTabContent';

interface KeywordsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  animateTabs: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  isLoading: boolean;
  isExporting: boolean;
  onRefresh: () => void;
  onExport: () => void;
  onUseKeyword: (keyword: string) => void;
}

const KeywordsTabs = ({ 
  activeTab, 
  onTabChange, 
  animateTabs,
  searchQuery,
  onSearchChange,
  filterValue,
  onFilterChange,
  isLoading,
  isExporting,
  onRefresh,
  onExport,
  onUseKeyword
}: KeywordsTabsProps) => {
  return (
    <Tabs defaultValue={activeTab} onValueChange={onTabChange}>
      <TabsList className="bg-secondary/30">
        <TabsTrigger value="research" className="transition-all duration-200 hover:bg-secondary/70">Research</TabsTrigger>
        <TabsTrigger value="clusters" className="transition-all duration-200 hover:bg-secondary/70">My Clusters</TabsTrigger>
        <TabsTrigger value="trends" className="transition-all duration-200 hover:bg-secondary/70">Trends</TabsTrigger>
        <TabsTrigger value="serp" className="transition-all duration-200 hover:bg-secondary/70">SERP Analysis</TabsTrigger>
        <TabsTrigger value="competitors" className="transition-all duration-200 hover:bg-secondary/70">Competitors</TabsTrigger>
      </TabsList>

      <TabsContent value="research" className={`mt-6 ${animateTabs ? 'animate-fade-in' : ''}`}>
        <ResearchTabContent onUseKeyword={onUseKeyword} />
      </TabsContent>
      
      <TabsContent value="clusters" className={`mt-6 ${animateTabs ? 'animate-fade-in' : ''}`}>
        <ClustersTabContent 
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          filterValue={filterValue}
          onFilterChange={onFilterChange}
          isLoading={isLoading}
          isExporting={isExporting}
          onRefresh={onRefresh}
          onExport={onExport}
          onUseKeyword={onUseKeyword}
        />
      </TabsContent>

      <TabsContent value="trends" className={`mt-6 ${animateTabs ? 'animate-fade-in' : ''}`}>
        <TrendsTabContent onUseKeyword={onUseKeyword} />
      </TabsContent>
      
      <TabsContent value="serp" className={`mt-6 ${animateTabs ? 'animate-fade-in' : ''}`}>
        <SerpTabContent onUseKeyword={onUseKeyword} navigate={useNavigate()} />
      </TabsContent>

      <TabsContent value="competitors" className={`mt-6 ${animateTabs ? 'animate-fade-in' : ''}`}>
        <CompetitorsTabContent onUseKeyword={onUseKeyword} />
      </TabsContent>
    </Tabs>
  );
};

export default KeywordsTabs;
