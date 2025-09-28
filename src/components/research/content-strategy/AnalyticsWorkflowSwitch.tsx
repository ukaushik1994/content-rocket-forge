import React from 'react';
import { Button } from '@/components/ui/button';

interface AnalyticsWorkflowSwitchProps {
  hasAnalytics: boolean;
  hasPublishedContent: boolean;
  onSwitchToEstimated: () => void;
  onSwitchToReal: () => void;
  currentMode: 'estimated' | 'real';
}

export const AnalyticsWorkflowSwitch = ({
  hasAnalytics,
  hasPublishedContent,
  onSwitchToEstimated,
  onSwitchToReal,
  currentMode
}: AnalyticsWorkflowSwitchProps) => {
  const canUseRealData = hasAnalytics && hasPublishedContent;

  return (
    <div className="flex gap-1 mb-4">
      <Button
        variant={currentMode === 'estimated' ? 'default' : 'ghost'}
        size="sm"
        onClick={onSwitchToEstimated}
      >
        Goal Mode
      </Button>
      <Button
        variant={currentMode === 'real' && canUseRealData ? 'default' : 'ghost'}
        size="sm"
        onClick={onSwitchToReal}
        disabled={!canUseRealData}
      >
        Analytics Mode
      </Button>
    </div>
  );
};