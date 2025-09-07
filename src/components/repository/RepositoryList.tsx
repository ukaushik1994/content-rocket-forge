import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { RepositoryListItem } from './RepositoryListItem';
import { motion } from 'framer-motion';

interface RepositoryListProps {
  items: ContentItemType[];
  onOpenDetailView: (content: ContentItemType) => void;
  onEdit?: (content: ContentItemType) => void;
  onPreview?: (content: ContentItemType) => void;
  onAnalyze?: (content: ContentItemType) => void;
  onPublish?: (content: ContentItemType) => void;
  onArchive?: (content: ContentItemType) => void;
  onDelete?: (content: ContentItemType) => void;
}

export const RepositoryList: React.FC<RepositoryListProps> = ({ 
  items, 
  onOpenDetailView,
  onEdit,
  onPreview,
  onAnalyze,
  onPublish,
  onArchive,
  onDelete
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
          onEdit={onEdit ? () => onEdit(item) : undefined}
          onPreview={onPreview ? () => onPreview(item) : undefined}
          onAnalyze={onAnalyze ? () => onAnalyze(item) : undefined}
          onPublish={onPublish ? () => onPublish(item) : undefined}
          onArchive={onArchive ? () => onArchive(item) : undefined}
          onDelete={onDelete ? () => onDelete(item) : undefined}
        />
      ))}
    </motion.div>
  );
};