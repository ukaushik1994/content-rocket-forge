
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SerpKeywordsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpKeywordsTab({ serpData, onAddToContent = () => {} }: SerpKeywordsTabProps) {
  if (!serpData.relatedKeywords || serpData.relatedKeywords.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No keyword data available for this search.
      </div>
    );
  }

  const keywords = serpData.relatedKeywords || [];
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg mb-2">Related Keywords</h3>
      <div className="grid grid-cols-1 gap-3">
        {keywords.map((keyword, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex justify-between items-center p-4">
                <div className="font-medium">{typeof keyword === 'string' ? keyword : keyword.query}</div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onAddToContent(typeof keyword === 'string' ? keyword : keyword.query, 'keyword')}
                  className="hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Volume data section - we'll only render this if available */}
      {serpData.volumeData && serpData.volumeData.length > 0 && (
        <div className="mt-8">
          <h3 className="font-medium text-lg mb-2">Keyword Volume Data</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {serpData.volumeData.map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="text-sm font-medium">{item.keyword}</div>
                  <div className="text-xl mt-1">{item.volume || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground mt-1">Monthly searches</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
