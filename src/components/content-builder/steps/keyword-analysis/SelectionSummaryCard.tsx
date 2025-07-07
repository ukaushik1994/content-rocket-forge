
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { CheckCircle, Eye, ArrowRight, Settings } from 'lucide-react';

interface SelectionSummaryCardProps {
  serpSelections: SerpSelection[];
  onOpenSelectionManager: () => void;
  onGenerateOutline: () => void;
  isGenerating?: boolean;
}

export function SelectionSummaryCard({
  serpSelections,
  onOpenSelectionManager,
  onGenerateOutline,
  isGenerating = false
}: SelectionSummaryCardProps) {
  const selectedItems = serpSelections.filter(item => item.selected);
  const totalSelected = selectedItems.length;
  
  // Group by type for summary
  const selectedByType = selectedItems.reduce((acc, item) => {
    const type = item.type === 'peopleAlsoAsk' ? 'question' : item.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeLabels = {
    question: 'Questions',
    heading: 'Headings',
    keyword: 'Keywords',
    relatedSearch: 'Related Terms',
    contentGap: 'Content Gaps',
    entity: 'Entities',
    snippet: 'Snippets'
  };

  return (
    <Card className="sticky top-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 border-green-200 dark:border-green-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Content Selection
          {totalSelected > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {totalSelected} selected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalSelected === 0 ? (
          <div className="text-center py-6">
            <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Select items from SERP analysis to include in your content generation
            </p>
          </div>
        ) : (
          <>
            {/* Selection Summary */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected for content generation:</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(selectedByType).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {count} {typeLabels[type] || type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preview of selected items */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Preview:</p>
              <div className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                {selectedItems.slice(0, 5).map((item, index) => (
                  <div key={index} className="truncate">
                    • {item.content}
                  </div>
                ))}
                {selectedItems.length > 5 && (
                  <div className="text-xs text-muted-foreground">
                    +{selectedItems.length - 5} more items...
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSelectionManager}
            className="w-full"
          >
            <Settings className="h-3 w-3 mr-2" />
            Manage Selections
          </Button>
          
          {totalSelected > 0 && (
            <Button
              onClick={onGenerateOutline}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Generate Outline
                </>
              )}
            </Button>
          )}
        </div>

        {totalSelected > 0 && (
          <div className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            💡 All selected items will be strategically integrated by AI to create your content outline and generate comprehensive, SEO-optimized content.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
