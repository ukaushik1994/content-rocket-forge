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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
        >
          <RepositoryCard 
            content={item} 
            onView={() => onOpenDetailView(item)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};