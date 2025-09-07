import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { RepositoryListItem } from './RepositoryListItem';
import { motion } from 'framer-motion';

interface RepositoryListProps {
  items: ContentItemType[];
  onOpenDetailView: (content: ContentItemType) => void;
}

export const RepositoryList: React.FC<RepositoryListProps> = ({ 
  items, 
  onOpenDetailView 
}) => {
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
      className="space-y-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {items.map((item) => (
        <RepositoryListItem 
          key={item.id} 
          content={item} 
          onView={() => onOpenDetailView(item)}
        />
      ))}
    </motion.div>
  );
};