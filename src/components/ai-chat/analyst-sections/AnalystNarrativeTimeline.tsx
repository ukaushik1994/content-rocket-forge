import React, { useMemo } from 'react';
import { AnalystState } from '@/hooks/useAnalystEngine';
import { ChartConfiguration } from '@/types/enhancedChat';
import { Loader2 } from 'lucide-react';

// Section components
import { PreviousSessionSection } from './PreviousSessionSection';
import { HealthAssessmentSection } from './HealthAssessmentSection';
import { PerformanceTrajectorySection } from './PerformanceTrajectorySection';
import { StrategicDivergenceSection } from './StrategicDivergenceSection';
import { ContentIntelligenceSection } from './ContentIntelligenceSection';
import { KeywordLandscapeSection } from './KeywordLandscapeSection';
import { CampaignPulseSection } from './CampaignPulseSection';
import { EngagementMetricsSection } from './EngagementMetricsSection';
import { CompetitivePositionSection } from './CompetitivePositionSection';
import { GoalProgressSection } from './GoalProgressSection';
import { WebIntelligenceSection } from './WebIntelligenceSection';
import { ExploreSection } from './ExploreSection';

interface Props {
  analystState: AnalystState | null;
  chartData: any[];
  dataKeys: string[];
  deepDivePrompts: string[];
  onSendMessage: (message: string) => void;
}

export const AnalystNarrativeTimeline: React.FC<Props> = ({
  analystState,
  chartData,
  dataKeys,
  deepDivePrompts,
  onSendMessage,
}) => {
  const hasAnalystData = analystState && (
    analystState.healthScore ||
    analystState.platformData.length > 0 ||
    analystState.insightsFeed.length > 0 ||
    analystState.accumulatedCharts.length > 0
  );

  // Empty state
  if (!hasAnalystData && chartData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="text-center max-w-xs space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/30 border border-border/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">Ask about your data</h3>
            <p className="text-sm text-muted-foreground">
              I'll build a live intelligence narrative as we chat — tracking health, performance, and strategic signals.
            </p>
          </div>
          {analystState?.isEnriching && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading platform data...
            </div>
          )}
          <ExploreSection analystState={null} deepDivePrompts={[]} onSendMessage={onSendMessage} />
        </div>
      </div>
    );
  }

  // Determine which sections show
  const hasChartData = chartData.length > 0;
  const hasAnomalies = analystState ? analystState.insightsFeed.some(i => i.type === 'warning' || i.source === 'cross-signal') : false;
  const hasContentTopics = analystState ? analystState.platformData.some(d => d.category === 'content') : false;
  const hasKeywordTopics = analystState ? analystState.topics.some(t => t.category === 'keywords') || analystState.platformData.some(d => d.category === 'keywords') : false;
  const hasCampaigns = analystState ? analystState.platformData.some(d => d.category === 'campaigns') : false;
  const hasEngagement = analystState ? analystState.platformData.some(d => ['email', 'social', 'engage'].includes(d.category)) : false;
  const hasCompetitors = analystState ? analystState.topics.some(t => t.category === 'competitors') : false;
  const hasGoal = analystState?.goalProgress != null;
  const hasWebSearch = analystState ? analystState.webSearchResults.length > 0 : false;

  return (
    <div className="space-y-8">
      {/* 10. Previous Session — placeholder, shows when session context exists */}
      {/* Future: check for persisted session context */}

      {/* 01. Health Assessment */}
      {analystState && <HealthAssessmentSection analystState={analystState} onSendMessage={onSendMessage} />}

      {/* 02. Performance Trajectory */}
      {hasChartData && analystState && (
        <PerformanceTrajectorySection analystState={analystState} chartData={chartData} dataKeys={dataKeys} onSendMessage={onSendMessage} />
      )}

      {/* 03. Strategic Divergence */}
      {hasAnomalies && analystState && (
        <StrategicDivergenceSection insights={analystState.insightsFeed} onSendMessage={onSendMessage} />
      )}

      {/* 04. Content Intelligence */}
      {hasContentTopics && analystState && (
        <ContentIntelligenceSection platformData={analystState.platformData} onSendMessage={onSendMessage} />
      )}

      {/* 05. Keyword Landscape */}
      {hasKeywordTopics && analystState && (
        <KeywordLandscapeSection topics={analystState.topics} platformData={analystState.platformData} onSendMessage={onSendMessage} />
      )}

      {/* 06. Campaign Pulse */}
      {hasCampaigns && analystState && (
        <CampaignPulseSection platformData={analystState.platformData} onSendMessage={onSendMessage} />
      )}

      {/* 07. Engagement Metrics */}
      {hasEngagement && analystState && (
        <EngagementMetricsSection platformData={analystState.platformData} onSendMessage={onSendMessage} />
      )}

      {/* 08. Competitive Position */}
      {hasCompetitors && analystState && (
        <CompetitivePositionSection topics={analystState.topics} onSendMessage={onSendMessage} />
      )}

      {/* 09. Goal Progress */}
      {hasGoal && analystState?.goalProgress && (
        <GoalProgressSection goalProgress={analystState.goalProgress} onSendMessage={onSendMessage} />
      )}

      {/* 11. Web Intelligence */}
      {hasWebSearch && analystState && (
        <WebIntelligenceSection webSearchResults={analystState.webSearchResults} onSendMessage={onSendMessage} />
      )}

      {/* 12. Explore — always last */}
      <ExploreSection analystState={analystState} deepDivePrompts={deepDivePrompts} onSendMessage={onSendMessage} />

      {/* Session summary counter */}
      {analystState && (analystState.accumulatedCharts.length > 0 || analystState.insightsFeed.length > 0) && (
        <div className="border-t border-border/10 pt-3">
          <p className="text-[9px] text-center text-muted-foreground/40">
            Session: {analystState.accumulatedCharts.length} charts · {analystState.insightsFeed.length} insights · {analystState.messageCount} messages
          </p>
        </div>
      )}
    </div>
  );
};
