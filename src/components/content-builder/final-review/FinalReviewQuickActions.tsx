
import React from 'react';
import { Button } from '@/components/ui/button';
import { RunChecksButton } from './RunChecksButton';
import { motion } from 'framer-motion';

interface FinalReviewQuickActionsProps {
  isRunningAllChecks: boolean;
  onRunAllChecks: () => void;
}

export const FinalReviewQuickActions = ({
  isRunningAllChecks,
  onRunAllChecks
}: FinalReviewQuickActionsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-wrap gap-3"
    >
      <RunChecksButton 
        isRunningAllChecks={isRunningAllChecks}
        onRunChecks={onRunAllChecks}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      />
    </motion.div>
  );
};
