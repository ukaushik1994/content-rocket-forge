
import React from 'react';
import { Loader2, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SerpLoadingStateProps {
  isLoading: boolean;
  navigateToStep: (step: number) => void;
}

export const SerpLoadingState: React.FC<SerpLoadingStateProps> = ({ 
  isLoading, 
  navigateToStep 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h3 className="font-medium">Analyzing search results</h3>
          <p className="text-sm text-muted-foreground mt-2">
            This may take a moment. We're gathering valuable data to help optimize your content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center p-6">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No SERP data available yet</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Enter your primary keyword and run an analysis to get insights from search results.
        </p>
        <Button onClick={() => navigateToStep(0)}>Enter Keywords</Button>
      </CardContent>
    </Card>
  );
};
