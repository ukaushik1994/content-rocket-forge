
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface KeywordInsightCardProps {
  keyword: string;
  relatedKeywords: string[];
  isLoading: boolean;
}

export const KeywordInsightCard: React.FC<KeywordInsightCardProps> = ({
  keyword,
  relatedKeywords,
  isLoading
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-xl">Keyword Insights: {keyword}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading insights...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Related Keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {relatedKeywords.length > 0 ? (
                  relatedKeywords.map((relatedKeyword, index) => (
                    <Badge key={index} variant="outline" className="py-1.5">
                      {relatedKeyword}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No related keywords found.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
