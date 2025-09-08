import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { MetricsTab } from './tabs/MetricsTab';
import { TrendingUp } from 'lucide-react';

interface InlineSerpAnalysisProps {
  serpData: SerpAnalysisResult;
  keyword: string;
}

export function InlineSerpAnalysis({
  serpData,
  keyword
}: InlineSerpAnalysisProps) {

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
            <div className="text-sm text-muted-foreground font-mono">{keyword}</div>
          </div>
        </div>
      </div>
      
      {/* Metrics Section */}
      <div className="relative z-10">
        <MetricsTab serpData={serpData} />
      </div>
    </div>
  );
}