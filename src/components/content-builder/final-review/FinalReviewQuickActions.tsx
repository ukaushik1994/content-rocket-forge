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
  return;
};