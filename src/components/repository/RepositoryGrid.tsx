import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { RepositoryCard } from './RepositoryCard';
import { motion } from 'framer-motion';

interface RepositoryGridProps {
  items: ContentItemType[];
  onOpenDetailView: (content: ContentItemType) => void;
}

export const RepositoryGrid: React.FC<RepositoryGridProps> = ({ 
  items, 
  onOpenDetailView 
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {items.map((item) => (
        <RepositoryCard 
          key={item.id} 
          content={item} 
          onView={() => onOpenDetailView(item)}
        />
      ))}
    </motion.div>
  );
};