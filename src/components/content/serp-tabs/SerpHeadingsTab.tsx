
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SerpHeadingsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpHeadingsTab({ serpData, onAddToContent = () => {} }: SerpHeadingsTabProps) {
  if (!serpData.headings || serpData.headings.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No headings data available for this search.
      </div>
    );
  }

  // Group headings by level (h1, h2, h3, etc.) if available
  const headings = serpData.headings || [];
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg mb-2">Common Headings in Top Results</h3>
      <div className="grid grid-cols-1 gap-3">
        {headings.map((heading, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex justify-between items-center p-4">
                <p className="font-medium">{typeof heading === 'string' ? heading : heading.text}</p>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onAddToContent(typeof heading === 'string' ? heading : heading.text, 'heading')}
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
    </div>
  );
}
