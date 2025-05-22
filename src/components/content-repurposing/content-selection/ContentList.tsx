
import React, { memo, useMemo } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import ContentItem from './ContentItem';
import { motion } from 'framer-motion';

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
  // Deduplicate content items by ID
  const uniqueContentItems = useMemo(() => {
    const uniqueItemsMap = new Map<string, ContentItemType>();
    contentItems.forEach(item => {
      if (item && item.id) {
        uniqueItemsMap.set(item.id, item);
      }
    });
    
    const uniqueItems = Array.from(uniqueItemsMap.values());
    if (uniqueItems.length !== contentItems.length) {
      console.log(`Removed ${contentItems.length - uniqueItems.length} duplicate items`);
    }
    
    return uniqueItems;
  }, [contentItems]);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  return (
    <motion.div 
      className={`grid grid-cols-1 ${isMobile ? '' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4 sm:gap-6`}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {uniqueContentItems.map(item => (
        <ContentItem 
          key={item.id}
          item={item}
          onSelectContent={() => onSelectContent(item)}
          onOpenRepurposedContent={onOpenRepurposedContent}
          isMobile={isMobile}
        />
      ))}
    </motion.div>
  );
});

ContentList.displayName = 'ContentList';

export default ContentList;
