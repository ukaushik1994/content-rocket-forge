import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

interface ContentReviewCardProps {
  onRunChecks: () => void;
  completionPercentage: number;
  passedChecks: number;
  totalChecks: number;
  hasFailedChecks: boolean;
}

export const ContentReviewCard: React.FC<ContentReviewCardProps> = ({
  onRunChecks,
  completionPercentage,
  passedChecks,
  totalChecks,
  hasFailedChecks
}) => {
  const { state } = useContentBuilder();
  const { content } = state;

  const hasContent = content && content.length > 0;
  const isGoodToGo = completionPercentage === 100 && hasContent;

  return (
    <Card className="bg-background/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Content Review
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onRunChecks}
            disabled={!hasContent}
            className="text-xs h-7 px-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Run Checks
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {hasContent ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Checks Passed
              </div>
              <Badge variant="secondary">
                {passedChecks} / {totalChecks}
              </Badge>
            </div>
            <div className="w-full h-1 bg-secondary rounded-full relative overflow-hidden">
              <div
                className="h-full bg-primary rounded-full absolute top-0 left-0"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Completion
              </div>
              <span className="text-sm font-medium">
                {completionPercentage}%
              </span>
            </div>
            {isGoodToGo ? (
              <div className="flex items-center gap-2 text-green-500 bg-green-50/50 rounded-md p-2 text-xs border border-green-200/50">
                <CheckCircle className="h-4 w-4" />
                All content checks passed!
              </div>
            ) : hasFailedChecks ? (
              <div className="flex items-center gap-2 text-amber-500 bg-amber-50/50 rounded-md p-2 text-xs border border-amber-200/50">
                <AlertCircle className="h-4 w-4" />
                Some checks failed. Review suggestions below.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-blue-500 bg-blue-50/50 rounded-md p-2 text-xs border border-blue-200/50">
                <AlertCircle className="h-4 w-4" />
                Run checks to see content suggestions.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No content to review
          </div>
        )}
      </CardContent>
    </Card>
  );
};
