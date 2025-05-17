
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentItemType } from '@/contexts/content/types';

interface ContentDetailsProps {
  content: ContentItemType;
}

export const ContentDetails: React.FC<ContentDetailsProps> = ({ content }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Content Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
          <p className="font-medium">{content.title}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Content Preview</h3>
          <p className="text-sm line-clamp-4">{content.content?.substring(0, 200)}...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentDetails;
