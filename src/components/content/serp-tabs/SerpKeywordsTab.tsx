
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SerpKeywordsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpKeywordsTab({ serpData, onAddToContent = () => {} }: SerpKeywordsTabProps) {
  if (!serpData.keywords || serpData.keywords.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No keyword data available for this search.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Related Keywords Section */}
      <div>
        <h3 className="font-medium text-lg mb-2">Related Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {serpData.keywords?.slice(0, 10).map((keyword, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10 py-1.5"
              onClick={() => onAddToContent(keyword, 'keyword')}
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Related Searches Section */}
      {serpData.relatedSearches && serpData.relatedSearches.length > 0 && (
        <div>
          <h3 className="font-medium text-lg mb-2 mt-6">Related Searches</h3>
          <div className="flex flex-wrap gap-2">
            {serpData.relatedSearches.slice(0, 8).map((search, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/10 py-1.5"
                onClick={() => onAddToContent(search, 'keyword')}
              >
                {search}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Keyword Analytics */}
      {serpData.volumeData && (
        <Card className="p-4 mt-6">
          <h3 className="font-medium text-lg mb-2">Keyword Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Search Volume</p>
              <p className="text-2xl font-bold">{serpData.volumeData?.volume || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Competition</p>
              <p className="text-2xl font-bold">{serpData.volumeData?.competition || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPC</p>
              <p className="text-2xl font-bold">${serpData.volumeData?.cpc || 'N/A'}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
