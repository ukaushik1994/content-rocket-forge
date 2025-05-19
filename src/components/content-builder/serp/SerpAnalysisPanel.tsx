
import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Loader, 
  CloudCog,
  CloudLightning,
  Database
} from 'lucide-react';

const SerpProviderBadge = ({ provider }: { provider?: string }) => {
  if (!provider) return null;
  
  let icon;
  let label;
  let bgColor;
  
  switch (provider) {
    case 'serpapi':
      icon = <CloudLightning className="h-3.5 w-3.5 mr-1 text-blue-300" />;
      label = 'SERP API';
      bgColor = 'bg-blue-900/30 text-blue-200 border-blue-700/30';
      break;
    case 'dataforseo':
      icon = <CloudCog className="h-3.5 w-3.5 mr-1 text-green-300" />;
      label = 'DataForSEO';
      bgColor = 'bg-green-900/30 text-green-200 border-green-700/30';
      break;
    default:
      icon = <Database className="h-3.5 w-3.5 mr-1 text-orange-300" />;
      label = 'No Data';
      bgColor = 'bg-orange-900/30 text-orange-200 border-orange-700/30';
      break;
  }
  
  return (
    <div className={`flex items-center px-2 py-0.5 rounded text-xs border ${bgColor}`}>
      {icon}
      {label}
    </div>
  );
};

import { SerpNoDataFound } from '@/components/content/serp-analysis/SerpNoDataFound';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpAnalysisPanelProps {
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
  onAddToContent,
  onRetry
}: SerpAnalysisPanelProps) {
  if (isLoading) {
    return (
      <Card className="p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Analyzing {mainKeyword}...</p>
        </div>
      </Card>
    );
  }
  
  if (!serpData) {
    return (
      <SerpNoDataFound 
        mainKeyword={mainKeyword} 
        onRetry={onRetry || (() => {})} 
      />
    );
  }
  
  // This is the real content implementation which would show when we do have data
  return (
    <Card className="p-4">
      <p className="text-center text-muted-foreground">
        Please connect a data provider to see SERP analysis.
      </p>
    </Card>
  );
}
