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
import { useAnalyticsConnection } from '@/hooks/useAnalyticsConnection';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';
import { useProposalIntegration } from '@/hooks/useProposalIntegration';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';

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
  const { aiProposals } = useContentStrategy();
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

      {/* Enhanced Proposals Section with Cross-Tab Integration */}
      {aiProposals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white">Generated Proposals</h3>
          <div className="grid gap-4">
            {aiProposals.map((proposal: any, index: number) => (
              <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{proposal.title}</h4>
                    <p className="text-sm text-muted-foreground">{proposal.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <ProposalStatusBadge proposalId={proposal.id || `temp-${index}`} />
                      <span className="text-xs text-blue-400">
                        Keyword: {proposal.primary_keyword}
                      </span>
                    </div>
                  </div>
                  <CrossTabActions 
                    proposalId={proposal.id || `temp-${index}`}
                    onAction={syncProposalAcrossTabs}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
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