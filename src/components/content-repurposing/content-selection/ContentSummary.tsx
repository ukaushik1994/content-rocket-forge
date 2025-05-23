
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';

interface ContentSummaryProps {
  item: ContentItemType;
  timeAgo?: string;
}

const ContentSummary: React.FC<ContentSummaryProps> = ({ item, timeAgo }) => {
  return (
    <div>
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-white">{item.title}</h3>
        {timeAgo && (
          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
            {timeAgo}
          </span>
        )}
      </div>
      {item.content && (
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {item.content.length > 120 ? item.content.substring(0, 120) + '...' : item.content}
        </p>
      )}
    </div>
  );
};

export default ContentSummary;
