import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { SerpAnalysisResult } from '@/services/serpApiService';

// Import refactored components
import {
  SerpSectionHeader,
  SerpEmptyState,
  SerpNoDataFound,
  SerpMetricsSection,
  SerpOverviewSection,
  SerpKeywordsSection,
  SerpQuestionsSection,
  SerpCompetitorsSection,
  SerpEntitiesSection,
  SerpHeadingsSection,
  SerpContentGapsSection
} from './serp-analysis';

export interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
  onRetry?: () => void;
}

export function SerpAnalysisPanel({ 
  serpData, 
  isLoading, 
  mainKeyword,
  onAddToContent = () => {},
  onRetry = () => {}
}: SerpAnalysisPanelProps) {
  const [expandedSections, setExpandedSections] = useState<{
    searchMetrics: boolean;
    overview: boolean;
    keywords: boolean;
    questions: boolean;
    competitors: boolean;
    entities: boolean;
    headings: boolean;
    contentGaps: boolean;
  }>({
    searchMetrics: true,
    overview: true,
    keywords: false,
    questions: false,
    competitors: false,
    entities: false,
    headings: false,
    contentGaps: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  if (isLoading) {
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

  // If serpData is null, show the NoDataFound component
  if (serpData === null && mainKeyword) {
    return <SerpNoDataFound mainKeyword={mainKeyword} onRetry={onRetry} />;
  }

  // If serpData is undefined or empty object, show the EmptyState
  if (!serpData) {
    return <SerpEmptyState />;
  }

  return (
    <div className="space-y-8">
      {/* Header with Search Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 p-5 rounded-xl border border-white/10 backdrop-blur-xl shadow-xl relative overflow-hidden"
      >
        {/* Interactive background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 opacity-10"></div>
          <motion.div
            className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              left: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute w-20 h-20 rounded-full bg-purple-500/10 filter blur-xl"
            animate={{
              x: ['-10%', '110%'],
              y: ['30%', '50%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute w-32 h-32 rounded-full bg-blue-500/10 filter blur-xl"
            animate={{
              x: ['110%', '-10%'],
              y: ['60%', '40%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        </div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-primary/20 rounded-full">
            <Search className="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-xl">
              Analysis for: <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">{mainKeyword}</span>
            </h3>
            <p className="text-sm text-muted-foreground">Interactive insights from top-ranking content</p>
          </div>
        </div>
        
        {/* Search Metrics Section */}
        <SerpSectionHeader 
          title="Search Metrics" 
          expanded={expandedSections.searchMetrics}
          onToggle={() => toggleSection('searchMetrics')}
          variant="blue"
          description="Keyword metrics to understand search volume and competition"
        />
        
        <SerpMetricsSection 
          serpData={serpData} 
          mainKeyword={mainKeyword} 
          expanded={expandedSections.searchMetrics} 
        />
      </motion.div>

      {/* Content Overview Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Content Strategy" 
          expanded={expandedSections.overview}
          onToggle={() => toggleSection('overview')}
          variant="purple"
          description="Strategic recommendations for structuring your content"
        />
        
        <SerpOverviewSection 
          serpData={serpData}
          mainKeyword={mainKeyword}
          expanded={expandedSections.overview}
          onAddToContent={onAddToContent}
        />
      </div>
      
      {/* Related Keywords Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Related Keywords" 
          expanded={expandedSections.keywords}
          onToggle={() => toggleSection('keywords')}
          variant="blue"
          description="Select keywords to include in your content"
          count={serpData?.relatedSearches?.length || 0}
        />
        
        <SerpKeywordsSection 
          serpData={serpData}
          expanded={expandedSections.keywords}
          onAddToContent={onAddToContent}
        />
      </div>
      
      {/* Questions Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="People Also Ask" 
          expanded={expandedSections.questions}
          onToggle={() => toggleSection('questions')}
          variant="amber"
          description="Common questions people search about this topic"
          count={serpData?.peopleAlsoAsk?.length || 0}
        />
        
        <SerpQuestionsSection 
          serpData={serpData}
          expanded={expandedSections.questions}
          onAddToContent={onAddToContent}
        />
      </div>
      
      {/* Entities Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Key Entities" 
          expanded={expandedSections.entities}
          onToggle={() => toggleSection('entities')}
          variant="indigo"
          description="Important entities and concepts related to this topic"
          count={serpData?.entities?.length || 0}
        />
        
        <SerpEntitiesSection 
          serpData={serpData}
          expanded={expandedSections.entities}
          onAddToContent={onAddToContent}
        />
      </div>
      
      {/* Headings Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Top Headings" 
          expanded={expandedSections.headings}
          onToggle={() => toggleSection('headings')}
          variant="teal"
          description="Common headings used by top-ranking content"
          count={serpData?.headings?.length || 0}
        />
        
        <SerpHeadingsSection 
          serpData={serpData}
          expanded={expandedSections.headings}
          onAddToContent={onAddToContent}
        />
      </div>
      
      {/* Content Gaps Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Content Gaps" 
          expanded={expandedSections.contentGaps}
          onToggle={() => toggleSection('contentGaps')}
          variant="rose"
          description="Topics competitors are missing that you can cover"
          count={serpData?.contentGaps?.length || 0}
        />
        
        <SerpContentGapsSection 
          serpData={serpData}
          expanded={expandedSections.contentGaps}
          onAddToContent={onAddToContent}
        />
      </div>
      
      {/* Top Ranks Section - Renamed from Competitor Analysis */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Top Ranks" 
          expanded={expandedSections.competitors}
          onToggle={() => toggleSection('competitors')}
          variant="green"
          description="Top-ranking content for this keyword"
          count={serpData?.topResults?.length || 0}
        />
        
        <SerpCompetitorsSection 
          serpData={serpData}
          expanded={expandedSections.competitors}
          onAddToContent={onAddToContent}
        />
      </div>
    </div>
  );
}
