
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { Star, Plus, Check, Lightbulb } from 'lucide-react';

interface ContentGapsTabProps {
  contentGaps: any[];
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
}

export function ContentGapsTab({ contentGaps, serpSelections, onToggleSelection }: ContentGapsTabProps) {
  const isSelected = (gap: string) => {
    return serpSelections.some(
      item => item.type === 'contentGap' && item.content === gap && item.selected
    );
  };

  if (contentGaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Star className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No content gaps found</h3>
        <p className="text-muted-foreground">
          No content opportunities were identified in the competitive analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Content Opportunities</h3>
          <p className="text-sm text-muted-foreground">
            Gaps in competitor content that you can capitalize on
          </p>
        </div>
        <Badge variant="outline">
          {contentGaps.length} opportunities
        </Badge>
      </div>

      <div className="space-y-3">
        {contentGaps.map((gap, index) => {
          const gapContent = typeof gap === 'string' ? gap : gap.content || gap.topic;
          const gapDescription = typeof gap === 'object' ? gap.description : '';
          const gapRecommendation = typeof gap === 'object' ? gap.recommendation : '';
          const selected = isSelected(gapContent);
          
          return (
            <Card key={index} className={`transition-all ${selected ? 'ring-2 ring-primary' : ''} bg-gradient-to-r from-rose-50/50 to-orange-50/50 dark:from-rose-900/10 dark:to-orange-900/10`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-rose-500" />
                      <Badge variant="outline" className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                        Opportunity
                      </Badge>
                    </div>
                    <p className="font-medium mb-2">{gapContent}</p>
                    {gapDescription && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {gapDescription}
                      </p>
                    )}
                    {gapRecommendation && (
                      <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {gapRecommendation}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToggleSelection('contentGap', gapContent)}
                    className="ml-4"
                  >
                    {selected ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" />
                        Select
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
