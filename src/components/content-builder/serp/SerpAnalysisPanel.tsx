
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
    case 'mock':
      icon = <Database className="h-3.5 w-3.5 mr-1 text-orange-300" />;
      label = 'Mock Data';
      bgColor = 'bg-orange-900/30 text-orange-200 border-orange-700/30';
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
  
  // Display the actual SERP data
  return (
    <Card className="p-4 space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-medium">SERP Analysis: {mainKeyword}</h2>
        </div>
        <SerpProviderBadge provider={serpData.provider} />
      </div>
      
      {/* Display key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {serpData.searchVolume !== undefined && (
          <div className="bg-card/50 p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">Search Volume</p>
            <p className="text-2xl font-bold">{serpData.searchVolume.toLocaleString()}</p>
          </div>
        )}
        
        {serpData.keywordDifficulty !== undefined && (
          <div className="bg-card/50 p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">Keyword Difficulty</p>
            <p className="text-2xl font-bold">{serpData.keywordDifficulty}/100</p>
          </div>
        )}
        
        {serpData.competitionScore !== undefined && (
          <div className="bg-card/50 p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">Competition</p>
            <p className="text-2xl font-bold">{serpData.competitionScore.toFixed(2)}</p>
          </div>
        )}
      </div>
      
      {/* Display headings */}
      {serpData.headings && serpData.headings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-md font-medium">Popular Headings</h3>
          <div className="space-y-2">
            {serpData.headings.map((heading, idx) => (
              <div 
                key={`heading-${idx}`} 
                className="bg-card/50 p-3 rounded-lg border flex justify-between items-center"
                onClick={() => onAddToContent?.(heading.text, 'heading')}
              >
                <div>
                  <p className="font-medium">{heading.text}</p>
                  {heading.subtext && <p className="text-sm text-muted-foreground">{heading.subtext}</p>}
                </div>
                <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded">
                  {heading.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Display people also ask questions */}
      {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-md font-medium">People Also Ask</h3>
          <div className="space-y-2">
            {serpData.peopleAlsoAsk.map((item, idx) => (
              <div 
                key={`question-${idx}`} 
                className="bg-card/50 p-3 rounded-lg border cursor-pointer hover:bg-card/70 transition-colors"
                onClick={() => onAddToContent?.(item.question, 'question')}
              >
                <p className="font-medium">{item.question}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
