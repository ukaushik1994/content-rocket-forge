
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { List } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpDataAnalysisProps {
  serpData: SerpAnalysisResult | null;
}

export const SerpDataAnalysis = ({ serpData }: SerpDataAnalysisProps) => {
  if (!serpData || Object.keys(serpData).length === 0) {
    return null;
  }
  
  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
          SERP Analysis Data
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {serpData.topResults && serpData.topResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <List className="h-4 w-4 text-blue-500" /> 
                  Top Ranking Pages
                </h4>
                <div className="space-y-2">
                  {serpData.topResults.slice(0, 3).map((result: any, idx: number) => (
                    <div key={`result-${idx}`} className="bg-card border rounded-md p-3">
                      <div className="text-xs font-medium text-blue-600">
                        Position {result.position}: {result.title || 'No title'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {result.url || 'No URL'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {serpData.relatedSearches && serpData.relatedSearches.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Related Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {serpData.relatedSearches.slice(0, 5).map((search: any, idx: number) => (
                    <div key={`search-${idx}`} className="bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 text-xs">
                      {search.query || 'No query'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
