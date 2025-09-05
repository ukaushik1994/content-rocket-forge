import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { TrendingUp, Settings } from 'lucide-react';
import { CustomStrategyCreator } from '../CustomStrategyCreator';
import { StrategyComparison } from '../StrategyComparison';
import { ContentStrategyEngine } from '../ContentStrategyEngine';
import { AnalyticsConnectionPrompt } from '../AnalyticsConnectionPrompt';
import { AnalyticsWorkflowSwitch } from '../AnalyticsWorkflowSwitch';
import { useAnalyticsConnection } from '@/hooks/useAnalyticsConnection';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';
interface StrategySuggestionsProps {
  serpMetrics: any;
  goals: any;
}
export const StrategySuggestions = ({
  serpMetrics,
  goals
}: StrategySuggestionsProps) => {
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [workflowMode, setWorkflowMode] = useState<'estimated' | 'real'>('estimated');
  
  const analyticsConnection = useAnalyticsConnection();
  const { metrics, contentAnalytics, loading: analyticsLoading } = useRealAnalytics('30days');

  const canUseRealData = analyticsConnection.hasAnyAnalytics && analyticsConnection.hasPublishedContent;
  
  return (
    <div className="space-y-6">
      {/* Analytics Connection Prompt */}
      {!analyticsConnection.loading && !canUseRealData && (
        <AnalyticsConnectionPrompt
          hasGoogleAnalytics={analyticsConnection.hasGoogleAnalytics}
          hasSearchConsole={analyticsConnection.hasSearchConsole}
          hasPublishedContent={analyticsConnection.hasPublishedContent}
        />
      )}

      {/* Workflow Mode Switch */}
      {!analyticsConnection.loading && (
        <AnalyticsWorkflowSwitch
          hasAnalytics={analyticsConnection.hasAnyAnalytics}
          hasPublishedContent={analyticsConnection.hasPublishedContent}
          onSwitchToEstimated={() => setWorkflowMode('estimated')}
          onSwitchToReal={() => setWorkflowMode('real')}
          currentMode={workflowMode}
        />
      )}

      {/* Content Strategy Engine with conditional data */}
      <ContentStrategyEngine 
        serpMetrics={serpMetrics} 
        goals={goals}
        workflowMode={workflowMode}
        realAnalytics={workflowMode === 'real' && canUseRealData ? {
          metrics,
          contentAnalytics,
          loading: analyticsLoading
        } : undefined}
      />
    </div>
  );
};