
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import ContentItem from './ContentItem';

interface ContentListProps {
  contentItems: ContentItemType[];
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  viewType?: 'new' | 'repurposed';
}

const ContentList: React.FC<ContentListProps> = ({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  viewType = 'new'
}) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {contentItems.map(item => (
        <ContentItem 
          key={item.id}
          item={item}
          onSelectContent={onSelectContent}
          onOpenRepurposedContent={onOpenRepurposedContent}
          viewType={viewType}
        />
      ))}
    </div>
  );
};

export default ContentList;
