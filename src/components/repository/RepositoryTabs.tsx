import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { RepositoryContent } from './RepositoryContent';
import { ContentItemType } from '@/contexts/content/types';

interface RepositoryTabsProps {
  onOpenDetailView: (content: ContentItemType) => void;
}

export const RepositoryTabs = React.memo(({ onOpenDetailView }: RepositoryTabsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <GlassCard className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RepositoryContent onOpenDetailView={onOpenDetailView} />
        </motion.div>
      </GlassCard>
    </motion.div>
  );
});

RepositoryTabs.displayName = "RepositoryTabs";