
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ContentItemType } from '@/contexts/content/types';
import ContentItem from './ContentItem';

interface ContentListProps {
  contentItems: ContentItemType[];
  onSelectContent: (content: ContentItemType) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  isMobile?: boolean;
}

const ContentList: React.FC<ContentListProps> = memo(({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  isMobile = false
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {contentItems.map((item) => (
        <ContentItem
          key={item.id}
          content={item}
          onSelect={() => onSelectContent(item)}
          onOpenRepurposedContent={onOpenRepurposedContent}
        />
      ))}
    </motion.div>
  );
});

ContentList.displayName = 'ContentList';

export default ContentList;
