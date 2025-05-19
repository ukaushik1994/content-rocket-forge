import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  RefreshCw, 
  Loader, 
  BarChart, 
  Database,
  CloudCog,
  CloudLightning
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
    case 'mock':
    default:
      icon = <Database className="h-3.5 w-3.5 mr-1 text-orange-300" />;
      label = 'Mock Data';
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

import { SerpAnalysisPanel as CoreSerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpAnalysisPanelProps {
  serpData: SerpAnalysisResult | null;
  isLoading: boolean;
  mainKeyword: string;
  onAddToContent?: (content: string, type: string) => void;
  onRetry?: () => void;
}

export function SerpAnalysisPanel(props: SerpAnalysisPanelProps) {
  return <CoreSerpAnalysisPanel {...props} />;
}
