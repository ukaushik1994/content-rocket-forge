
import React from 'react';
import { FinalReviewQuickActions } from '../../final-review/FinalReviewQuickActions';

interface OptimizeReviewActionsProps {
  isRunningAllChecks: boolean;
  onRunAllChecks: () => void;
  activeTab: string;
  onRunTabChecks: () => void;
}

export const OptimizeReviewActions: React.FC<OptimizeReviewActionsProps> = ({
  isRunningAllChecks,
  onRunAllChecks,
  activeTab,
  onRunTabChecks
}) => {
  return (
    <FinalReviewQuickActions 
      isRunningAllChecks={isRunningAllChecks}
      onRunAllChecks={onRunAllChecks}
      activeTab={activeTab}
      onRunTabChecks={onRunTabChecks}
    />
  );
};
