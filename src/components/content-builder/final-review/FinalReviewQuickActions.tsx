
import React from 'react';
import { Button } from '@/components/ui/button';
import { RunChecksButton } from './RunChecksButton';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, BarChart2, Settings } from 'lucide-react';

interface FinalReviewQuickActionsProps {
  isRunningAllChecks: boolean;
  onRunAllChecks: () => void;
  activeTab: string;
  onRunTabChecks: () => void;
}

export const FinalReviewQuickActions = ({
  isRunningAllChecks,
  onRunAllChecks,
  activeTab,
  onRunTabChecks
}: FinalReviewQuickActionsProps) => {
  // Get the appropriate action label and icon based on active tab
  const getTabAction = () => {
    switch (activeTab) {
      case 'overview':
        return {
          label: 'Check Content',
          icon: <FileText className="h-4 w-4" />
        };
      case 'optimize':
        return {
          label: 'Run SEO Analysis',
          icon: <BarChart2 className="h-4 w-4" />
        };
      case 'technical':
        return {
          label: 'Check Structure',
          icon: <Settings className="h-4 w-4" />
        };
      default:
        return {
          label: 'Run Check',
          icon: <CheckCircle className="h-4 w-4" />
        };
    }
  };

  const tabAction = getTabAction();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-wrap gap-3"
    >
      {/* Primary action button specific to the current tab */}
      <Button
        onClick={onRunTabChecks}
        disabled={isRunningAllChecks}
        className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 gap-2"
      >
        {tabAction.icon}
        {tabAction.label}
      </Button>
      
      {/* Secondary action for running all checks */}
      <RunChecksButton 
        isRunningAllChecks={isRunningAllChecks}
        onRunChecks={onRunAllChecks}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
      />
    </motion.div>
  );
};
