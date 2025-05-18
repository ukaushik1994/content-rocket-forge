
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import ContentItem from './ContentItem';

interface ContentListProps {
  contentItems: ContentItemType[];
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
}

const ContentList: React.FC<ContentListProps> = ({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent
}) => {
  return (
    <div className="grid gap-4">
      {contentItems.map(item => (
        <ContentItem 
          key={item.id}
          item={item}
          onSelectContent={onSelectContent}
          onOpenRepurposedContent={onOpenRepurposedContent}
        />
      ))}
    </div>
  );
};

export default ContentList;
