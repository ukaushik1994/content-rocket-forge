
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SerpContentGapsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpContentGapsTab({ serpData, onAddToContent = () => {} }: SerpContentGapsTabProps) {
  // Content gaps are typically topics that are mentioned in competing content but not in your content
  // This is a simplified implementation - in a real app you'd have more sophisticated gap analysis
  
  if (!serpData.contentGaps || serpData.contentGaps.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No content gap data available for this search.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg mb-2">Content Gaps</h3>
      <div className="grid grid-cols-1 gap-3">
        {serpData.contentGaps.map((gap, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex justify-between items-center p-4">
                <div>
                  <p className="font-medium">{gap.topic}</p>
                  {gap.description && (
                    <p className="text-sm text-muted-foreground mt-1">{gap.description}</p>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onAddToContent(gap.topic, 'contentGap')}
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
