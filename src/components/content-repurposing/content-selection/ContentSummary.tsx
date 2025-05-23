
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';

interface ContentSummaryProps {
  item: ContentItemType;
}

const ContentSummary: React.FC<ContentSummaryProps> = ({ item }) => {
  return (
    <div>
      <h3 className="font-medium text-white">{item.title}</h3>
      {item.content && (
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {item.content.length > 120 ? item.content.substring(0, 120) + '...' : item.content}
        </p>
      )}
    </div>
  );
};

export default ContentSummary;
