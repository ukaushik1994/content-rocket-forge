import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { TrendingUp, Settings } from 'lucide-react';
import { CustomStrategyCreator } from '../CustomStrategyCreator';
import { StrategyComparison } from '../StrategyComparison';
import { ContentStrategyEngine } from '../ContentStrategyEngine';
import { AnalyticsConnectionPrompt } from '../AnalyticsConnectionPrompt';
import { AnalyticsWorkflowSwitch } from '../AnalyticsWorkflowSwitch';
import { ProposalStatusBadge } from '../components/ProposalStatusBadge';
import { CrossTabActions } from '../components/CrossTabActions';
import { EnhancedAIProposalCard } from '../components/EnhancedAIProposalCard';
import { useAnalyticsConnection } from '@/hooks/useAnalyticsConnection';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useProposalIntegration } from '@/hooks/useProposalIntegration';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { ProposalsLoadingSkeleton } from '../components/ProposalsLoadingSkeleton';

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
  const { loading: analyticsLoading } = useAnalyticsData();
  const metrics = null;
  const contentAnalytics: any[] = [];
  const { aiProposals, loadingProposals } = useContentStrategy();
  const { 
    syncProposalAcrossTabs,
    updateProposalStatus 
  } = useProposalIntegration();

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
      {loadingProposals ? (
        <ProposalsLoadingSkeleton />
      ) : (
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
      )}
    </div>
  );
};