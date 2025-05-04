
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ContentGap {
  topic: string;
  description: string;
  recommendation?: string;
}

interface ContentGapsCardProps {
  contentGaps?: ContentGap[] | null;
}

export const ContentGapsCard = ({ contentGaps }: ContentGapsCardProps) => {
  if (!contentGaps || contentGaps.length === 0) {
    return (
      <Card className="h-full shadow-md">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
            Content Gaps
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] flex-col gap-2 text-center">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No content gaps identified.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
          Content Gaps
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 max-h-[300px] overflow-y-auto">
        <div className="space-y-4">
          {contentGaps.map((gap, index) => (
            <div key={index} className="border border-rose-500/20 rounded-md p-3 bg-rose-500/5">
              <h4 className="text-sm font-medium mb-1">{gap.topic}</h4>
              <p className="text-xs text-muted-foreground mb-2">{gap.description}</p>
              {gap.recommendation && (
                <div className="border-t border-rose-500/10 pt-2 mt-2">
                  <p className="text-xs"><span className="font-medium text-rose-400">Recommendation:</span> {gap.recommendation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <p>Address these content gaps to improve your content's competitiveness and relevance.</p>
        </div>
      </CardContent>
    </Card>
  );
};
