
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import ContentItem from './ContentItem';
import { motion } from 'framer-motion';

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
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {contentItems.map(item => (
        <ContentItem 
          key={item.id}
          item={item}
          onSelectContent={onSelectContent}
          onOpenRepurposedContent={onOpenRepurposedContent}
        />
      ))}
    </motion.div>
  );
};

export default ContentList;
