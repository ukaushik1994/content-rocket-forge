
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SerpCompetitorsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpCompetitorsTab({ serpData, onAddToContent = () => {} }: SerpCompetitorsTabProps) {
  // Handle case where competitors data isn't available
  const competitors = serpData.topResults || [];
  
  if (competitors.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No competitor data available for this search.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg mb-2">Top Competing Content</h3>
      <div className="grid grid-cols-1 gap-3">
        {competitors.map((competitor, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex justify-between items-center p-4">
                <div>
                  <p className="font-medium">{competitor.title}</p>
                  {competitor.snippet && (
                    <p className="text-sm text-muted-foreground mt-1">{competitor.snippet}</p>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onAddToContent(competitor.title, 'competitor')}
                  className="hover:bg-primary/10 shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
