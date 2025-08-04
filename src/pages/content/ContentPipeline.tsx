
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ContentPipeline = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Content Pipeline</h1>
          <p className="text-muted-foreground">Manage your content workflow</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Management</CardTitle>
            <CardDescription>Coming soon - Content workflow and pipeline management</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This feature is under development.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentPipeline;
