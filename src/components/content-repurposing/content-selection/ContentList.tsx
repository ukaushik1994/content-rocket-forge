
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ContentItemType } from '@/contexts/content/types';
import ContentItem from './ContentItem';

interface ContentListProps {
  contentItems: ContentItemType[];
  onSelectContent: (content: ContentItemType) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  savedContentFormats?: string[];
  isMobile?: boolean;
}

const ContentList: React.FC<ContentListProps> = memo(({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  savedContentFormats = [],
  isMobile = false
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-4 sm:gap-6"
    >
      {contentItems.map((item) => (
        <ContentItem
          key={item.id}
          item={item}
          onSelect={onSelectContent}
          onOpenRepurposedContent={onOpenRepurposedContent}
          savedContentFormats={savedContentFormats}
          isMobile={isMobile}
        />
      ))}
    </motion.div>
  );
});

ContentList.displayName = 'ContentList';

export default ContentList;
