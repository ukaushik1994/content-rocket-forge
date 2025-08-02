
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContentRepurposingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Content Repurposing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Repurpose Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Content repurposing tools will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentRepurposingPage;
