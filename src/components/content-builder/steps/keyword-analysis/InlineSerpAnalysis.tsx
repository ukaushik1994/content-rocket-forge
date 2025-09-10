import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { MetricsTab } from './tabs/MetricsTab';
import { TrendingUp, Loader2 } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

interface InlineSerpAnalysisProps {
  serpData: SerpAnalysisResult;
  keyword: string;
}

export function InlineSerpAnalysis({
  serpData,
  keyword
}: InlineSerpAnalysisProps) {
  const { state } = useContentBuilder();
  const { isAnalyzing } = state;

  // Show loading state when analyzing new keyword
  if (isAnalyzing && !serpData) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg backdrop-blur-sm border border-white/10">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Analyzing SERP Data
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                Analyzing for: {keyword}
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 p-8 text-center bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Gathering SERP intelligence for "{keyword}"...</span>
          </div>
        </div>
      </div>
    );
  }

  // Validate that displayed data matches current keyword
  const isDataStale = serpData && serpData.keyword && serpData.keyword !== keyword;

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg backdrop-blur-sm border border-white/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              SERP Analysis
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              {keyword}
              {isDataStale && (
                <span className="ml-2 text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md">
                  Data from: {serpData.keyword}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Metrics Section */}
      <div className="relative z-10">
        {isDataStale && (
          <div className="mb-4 p-3 bg-orange-400/10 border border-orange-400/20 rounded-lg">
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Showing data for "{serpData.keyword}" - analyzing "{keyword}" now...</span>
            </div>
          </div>
        )}
        <MetricsTab serpData={serpData} keyword={keyword} />
      </div>
    </div>
  );
}