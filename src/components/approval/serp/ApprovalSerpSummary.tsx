
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, HelpCircle, FileText, Tag, Heading, FileSearch } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SerpAnalysisResult } from '@/types/serp';
import {
  SerpSectionHeader,
  SerpKeywordsSection,
  SerpQuestionsSection,
  SerpEntitiesSection,
  SerpHeadingsSection
} from '@/components/content/serp-analysis';

interface ApprovalSerpSummaryProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
  className?: string;
}

export const ApprovalSerpSummary: React.FC<ApprovalSerpSummaryProps> = ({
  serpData,
  isLoading,
  mainKeyword,
  onAddToContent = () => {},
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('keywords');

  if (isLoading) {
    return (
      <div className={`p-4 bg-white/5 border border-white/10 rounded-lg ${className}`}>
        <div className="h-20 w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-purple"></div>
          <p className="ml-3 text-white/70">Loading SERP data...</p>
        </div>
      </div>
    );
  }

  if (!serpData) {
    return (
      <div className={`p-4 bg-white/5 border border-white/10 rounded-lg ${className}`}>
        <div className="flex flex-col items-center justify-center py-6">
          <Search className="h-8 w-8 text-white/30 mb-2" />
          <p className="text-white/50">No SERP data available</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-white/10 bg-black/20 backdrop-blur-lg overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-neon-purple" />
          <h3 className="text-sm font-medium">
            SERP Analysis: <span className="text-neon-purple">{mainKeyword}</span>
          </h3>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none p-0 grid grid-cols-4">
          <TabsTrigger
            value="keywords"
            className="rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
            onClick={() => setActiveTab('keywords')}
          >
            <Tag className="h-4 w-4 mr-2" /> Keywords
          </TabsTrigger>
          <TabsTrigger
            value="questions"
            className="rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
            onClick={() => setActiveTab('questions')}
          >
            <HelpCircle className="h-4 w-4 mr-2" /> Questions
          </TabsTrigger>
          <TabsTrigger
            value="entities"
            className="rounded-none border-r border-white/10 data-[state=active]:bg-white/5"
            onClick={() => setActiveTab('entities')}
          >
            <FileSearch className="h-4 w-4 mr-2" /> Entities
          </TabsTrigger>
          <TabsTrigger
            value="headings"
            className="rounded-none data-[state=active]:bg-white/5"
            onClick={() => setActiveTab('headings')}
          >
            <Heading className="h-4 w-4 mr-2" /> Headings
          </TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-2 max-h-[400px] overflow-y-auto">
          <TabsContent value="keywords" className="mt-0 py-2">
            <SerpKeywordsSection
              serpData={serpData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          </TabsContent>
          
          <TabsContent value="questions" className="mt-0 py-2">
            <SerpQuestionsSection
              serpData={serpData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          </TabsContent>
          
          <TabsContent value="entities" className="mt-0 py-2">
            <SerpEntitiesSection
              serpData={serpData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          </TabsContent>
          
          <TabsContent value="headings" className="mt-0 py-2">
            <SerpHeadingsSection
              serpData={serpData}
              expanded={true}
              onAddToContent={onAddToContent}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};
