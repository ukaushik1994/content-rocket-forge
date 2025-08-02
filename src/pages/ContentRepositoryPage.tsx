
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContentRepositoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Content Repository</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Content repository will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentRepositoryPage;
