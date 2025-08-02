
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ResearchPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Research</h1>
      <Card>
        <CardHeader>
          <CardTitle>Content Research</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Research tools will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearchPage;
