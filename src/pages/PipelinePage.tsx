
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PipelinePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pipeline</h1>
      <Card>
        <CardHeader>
          <CardTitle>Content Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Content pipeline will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelinePage;
