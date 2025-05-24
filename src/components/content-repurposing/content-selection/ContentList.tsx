
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
      className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
    >
      {contentItems.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.random() * 0.2 }}
        >
          <ContentItem
            content={item}
            onSelect={() => onSelectContent(item)}
            onOpenRepurposedContent={onOpenRepurposedContent}
          />
        </motion.div>
      ))}
    </motion.div>
  );
});

ContentList.displayName = 'ContentList';

export default ContentList;
