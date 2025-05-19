
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';

interface SelectedSerpItemsCardProps {
  serpSelections: SerpSelection[];
}

export const SelectedSerpItemsCard = ({ serpSelections }: SelectedSerpItemsCardProps) => {
  if (!serpSelections || serpSelections.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Selected SERP Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No SERP items selected. Analyze SERPs first and select relevant content.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Selected SERP Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
        {serpSelections.map((item, index) => (
          <div key={index} className="border-l-2 border-primary pl-3 py-1">
            <span className="text-xs font-medium text-muted-foreground block mb-1">
              {item.type}
            </span>
            <p className="text-sm">{item.content}</p>
            {item.source && (
              <span className="text-xs text-muted-foreground block mt-1">
                Source: {item.source}
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
