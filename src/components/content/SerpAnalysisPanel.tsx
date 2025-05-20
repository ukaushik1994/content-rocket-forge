
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';

// Import refactored components
import {
  SerpSectionHeader,
  SerpEmptyState,
  SerpNoDataFound,
  SerpMetricsSection,
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
  onSerpDataChange?: (data: SerpAnalysisResult | null) => void;
}

export function SerpAnalysisPanel({ 
  serpData: initialSerpData, 
  isLoading: initialIsLoading, 
  mainKeyword,
  onAddToContent = () => {},
  onRetry = () => {},
  onSerpDataChange = () => {}
}: SerpAnalysisPanelProps) {
  const [expandedSections, setExpandedSections] = useState<{
    searchMetrics: boolean;
    keywords: boolean;
    questions: boolean;
    competitors: boolean;
    entities: boolean;
    headings: boolean;
    contentGaps: boolean;
  }>({
    searchMetrics: true,
    keywords: false,
    questions: false,
    competitors: false,
    entities: false,
    headings: false,
    contentGaps: false
  });
  
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
      // Call the API to get real SERP data
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  // If serpData is null, show the NoDataFound component
  if (internalSerpData === null && mainKeyword) {
    return <SerpNoDataFound mainKeyword={mainKeyword} onRetry={handleRetry} />;
  }

  // If serpData is undefined or empty object, show the EmptyState
  if (!internalSerpData) {
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
          serpData={internalSerpData} 
          mainKeyword={mainKeyword} 
          expanded={expandedSections.searchMetrics} 
        />
      </motion.div>

      {/* Related Keywords Section */}
      <div className="space-y-4">
        <SerpSectionHeader 
          title="Related Keywords" 
          expanded={expandedSections.keywords}
          onToggle={() => toggleSection('keywords')}
          variant="blue"
          description="Select keywords to include in your content"
          count={internalSerpData?.relatedSearches?.length || 0}
        />
        
        <SerpKeywordsSection 
          serpData={internalSerpData}
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
          count={internalSerpData?.peopleAlsoAsk?.length || 0}
        />
        
        <SerpQuestionsSection 
          serpData={internalSerpData}
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
          count={internalSerpData?.entities?.length || 0}
        />
        
        <SerpEntitiesSection 
          serpData={internalSerpData}
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
          count={internalSerpData?.headings?.length || 0}
        />
        
        <SerpHeadingsSection 
          serpData={internalSerpData}
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
          count={internalSerpData?.contentGaps?.length || 0}
        />
        
        <SerpContentGapsSection 
          serpData={internalSerpData}
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
          count={internalSerpData?.topResults?.length || 0}
        />
        
        <SerpCompetitorsSection 
          serpData={internalSerpData}
          expanded={expandedSections.competitors}
          onAddToContent={onAddToContent}
        />
      </div>
    </div>
  );
}
