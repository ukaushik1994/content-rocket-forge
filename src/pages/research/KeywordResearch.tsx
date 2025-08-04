
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const KeywordResearch = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Keyword Research</h1>
          <p className="text-muted-foreground">Discover high-impact keywords for your content strategy</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Keyword Research Tool</CardTitle>
            <CardDescription>Coming soon - Advanced keyword analysis and research capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This feature is under development.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KeywordResearch;
