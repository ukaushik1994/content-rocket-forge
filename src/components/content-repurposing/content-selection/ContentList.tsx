
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import ContentItem from './ContentItem';

interface ContentListProps {
  contentItems: ContentItemType[];
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  onDeleteContent?: (contentId: string, formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
  viewType?: 'new' | 'repurposed';
  selectedContentId?: string;
}

const ContentList: React.FC<ContentListProps> = ({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  onDeleteContent,
  isDeleting = false,
  viewType = 'new',
  selectedContentId
}) => {
  return (
    <div className="grid gap-3">
      {contentItems.map(item => (
        <ContentItem 
          key={item.id}
          item={item}
          onSelectContent={onSelectContent}
          onOpenRepurposedContent={onOpenRepurposedContent}
          onDeleteContent={onDeleteContent}
          isDeleting={isDeleting}
          viewType={viewType}
          isSelected={selectedContentId === item.id}
        />
      ))}
    </div>
  );
};

export default ContentList;
