import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

export function SeoAnalysisHeader() {
  const { state } = useContentBuilder();
  const { seoScore } = state;

  return (
    <Card className="bg-background/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-sm font-medium">SEO Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{seoScore}</p>
        <p className="text-muted-foreground">Current SEO Score</p>
      </CardContent>
    </Card>
  );
}
