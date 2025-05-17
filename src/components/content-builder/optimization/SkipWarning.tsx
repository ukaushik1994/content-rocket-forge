
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SkipWarningProps } from '@/hooks/seo-analysis/types';

export const SkipWarning = ({ onSkip, onCancel }: SkipWarningProps) => {
  return (
    <Card className="border-yellow-500/30 bg-yellow-50/10 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="bg-yellow-500/10 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-yellow-700 mb-1">Optimization Step Skipped</h3>
            <p className="text-yellow-600 text-sm mb-4">
              You've skipped the content optimization step. While you can continue with your content as is, 
              running the SEO analysis can help improve your content quality and search ranking.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel} className="border-yellow-500/30 text-yellow-700 hover:bg-yellow-500/10">
                Run Analysis
              </Button>
              <Button onClick={onSkip} variant="ghost" className="text-muted-foreground">
                Continue Without Optimization
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
