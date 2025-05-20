
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ContentDetailsProps {
  content: ContentItemType;
  onReset: () => void;
}

const ContentDetails: React.FC<ContentDetailsProps> = ({ content, onReset }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          {content.title}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onReset} className="flex items-center space-x-1">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Selection</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p className="line-clamp-2">
            {content.content && typeof content.content === 'string' 
              ? content.content.substring(0, 150) + (content.content.length > 150 ? '...' : '')
              : 'No content preview available'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentDetails;
