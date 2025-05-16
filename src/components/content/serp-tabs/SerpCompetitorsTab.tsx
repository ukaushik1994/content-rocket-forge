
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SerpCompetitorsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpCompetitorsTab({ serpData, onAddToContent = () => {} }: SerpCompetitorsTabProps) {
  if (!serpData.competitors || serpData.competitors.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No competitor data available for this search.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg mb-2">Top Ranking Content</h3>
      <div className="grid grid-cols-1 gap-3">
        {serpData.competitors.map((competitor, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-base line-clamp-2">{competitor.title}</h4>
                  <span className="text-sm font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5 shrink-0">
                    #{index + 1}
                  </span>
                </div>
                
                {competitor.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {competitor.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">{competitor.domain}</span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    asChild
                  >
                    <a 
                      href={competitor.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
