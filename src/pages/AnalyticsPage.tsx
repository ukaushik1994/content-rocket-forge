
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Content Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Analytics dashboard will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
