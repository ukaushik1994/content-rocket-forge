
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, SearchX, Loader2 } from 'lucide-react';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { SerpLoadingState } from '@/components/content-builder/serp/SerpLoadingState';

// Import refactored components
import {
  SerpSectionHeader,
  SerpEmptyState,
  SerpMetricsSection,
  SerpOverviewSection,
  SerpKeywordsSection,
  SerpQuestionsSection,
  SerpCompetitorsSection
} from './serp-analysis';

export interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpAnalysisPanel({ 
  serpData, 
  isLoading, 
  mainKeyword,
  onAddToContent = () => {}
}: SerpAnalysisPanelProps) {
  const [expandedSections, setExpandedSections] = useState<{
    searchMetrics: boolean;
    overview: boolean;
    keywords: boolean;
    questions: boolean;
    competitors: boolean;
  }>({
    searchMetrics: true,
    overview: true,
    keywords: false,
    questions: false,
    competitors: false
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

  if (!serpData) {
    return <SerpEmptyState />;
  }

  return (
    <div className="space-y-8">
      {/* Header with Search Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 p-5 rounded-xl border border-white/10 backdrop-blur-xl shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/20 rounded-full">
            <Search className="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-xl">
              Analysis for: <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">{mainKeyword}</span>
            </h3>
            <p className="text-sm text-muted-foreground">Select items to include in your content outline</p>
          </div>
        </div>
        
        {/* Search Metrics Section */}
        <SerpSectionHeader 
          title="Search Metrics" 
          expanded={expandedSections.searchMetrics}
          onToggle={() => toggleSection('searchMetrics')}
          variant="blue"
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
        />
        
        <SerpQuestionsSection 
          serpData={serpData}
          expanded={expandedSections.questions}
          onAddToContent={onAddToContent}
        />
      </div>
      
      {/* Competitor Analysis Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Competitor Analysis" 
          expanded={expandedSections.competitors}
          onToggle={() => toggleSection('competitors')}
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
