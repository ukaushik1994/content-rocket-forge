
import React from 'react';
import { ContentItem } from './ContentItem';
import { motion } from 'framer-motion';

interface ContentGridProps {
  items: any[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ContentGrid: React.FC<ContentGridProps> = ({ 
  items,
  onView,
  onEdit,
  onDelete
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {items.map((item) => (
        <ContentItem 
          key={item.id} 
          item={item} 
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
};
