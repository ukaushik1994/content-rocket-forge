import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { Bug } from 'lucide-react';

export const SerpDebugPanel: React.FC = () => {
  const { state } = useContentBuilder();
  
  const selectedItems = state.serpSelections.filter(item => item.selected);
  const groupedSelections = state.serpSelections.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="border-yellow-500/20 bg-yellow-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-400">
          <Bug className="h-4 w-4" />
          SERP Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Context State</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Main Keyword: {state.mainKeyword || 'Not set'}</div>
            <div>SERP Data: {state.serpData ? 'Available' : 'None'}</div>
            <div>Is Analyzing: {state.isAnalyzing ? 'Yes' : 'No'}</div>
            <div>Total Selections: {state.serpSelections.length}</div>
            <div>Selected Items: {selectedItems.length}</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Selection Breakdown</h4>
          <div className="flex flex-wrap gap-1">
            {Object.entries(groupedSelections).map(([type, count]) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type}: {count}
              </Badge>
            ))}
          </div>
        </div>

        {state.serpData && (
          <div>
            <h4 className="font-medium mb-2">SERP Data Properties</h4>
            <div className="text-xs text-muted-foreground">
              <div>Keyword: {state.serpData.keyword}</div>
              <div>Questions: {state.serpData.peopleAlsoAsk?.length || 0}</div>
              <div>Headings: {state.serpData.headings?.length || 0}</div>
              <div>Entities: {state.serpData.entities?.length || 0}</div>
              <div>Keywords: {state.serpData.keywords?.length || 0}</div>
              <div>Content Gaps: {state.serpData.contentGaps?.length || 0}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};