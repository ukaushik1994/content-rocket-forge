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
import { AIProposalCard } from '../components/AIProposalCard';
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

      {/* Enhanced Proposals Section with Beautiful Cards */}
      {aiProposals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Generated Proposals
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{aiProposals.length} proposals</span>
              <span>•</span>
              <span>AI-powered suggestions</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {aiProposals.map((proposal: any, index: number) => {
              const proposalId = proposal.id || `temp-${index}`;
              return (
                <AIProposalCard
                  key={proposalId}
                  proposal={proposal}
                  isSelected={false}
                  isNew={false}
                  onToggleSelect={() => {
                    // Handle proposal selection if needed
                    console.log('Toggled proposal:', proposalId);
                  }}
                  onScheduleToCalendar={(proposal) => {
                    syncProposalAcrossTabs(proposalId, 'schedule_to_calendar', proposal);
                  }}
                  onAddToPipeline={(proposal) => {
                    syncProposalAcrossTabs(proposalId, 'add_to_pipeline', proposal);
                  }}
                  onViewDetails={(proposal) => {
                    console.log('View proposal details:', proposal);
                  }}
                  showActions={true}
                />
              );
            })}
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