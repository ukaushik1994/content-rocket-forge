import React, { useMemo, useCallback } from 'react';
import { AnalystState } from '@/hooks/useAnalystEngine';
import { ChartConfiguration } from '@/types/enhancedChat';
import { Loader2, AlertTriangle } from 'lucide-react';

// Section components
import { PreviousSessionSection } from './PreviousSessionSection';
import { StrategicStanceSection } from './StrategicStanceSection';
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

// ─── Adaptive Section Ordering (Fix 9) ─────────────────────────────────────
const SECTION_INTERACTION_KEY = 'analyst_section_interactions';

function getSectionInteractions(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SECTION_INTERACTION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function recordSectionInteraction(sectionId: string): void {
  try {
    const interactions = getSectionInteractions();
    interactions[sectionId] = (interactions[sectionId] || 0) + 1;
    localStorage.setItem(SECTION_INTERACTION_KEY, JSON.stringify(interactions));
  } catch { /* quota */ }
}

interface Props {
  analystState: AnalystState | null;
  chartData: any[];
  dataKeys: string[];
  deepDivePrompts: string[];
  onSendMessage: (message: string) => void;
}

interface SectionDef {
  id: string;
  visible: boolean;
  render: () => React.ReactNode;
  fixed?: boolean;
  category?: string; // for topic-aware relevance scoring
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

  const handleSectionClick = useCallback((sectionId: string) => {
    recordSectionInteraction(sectionId);
  }, []);

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

  // Build section definitions for adaptive ordering
  const sections: SectionDef[] = [
    // Fixed sections (always at top)
    {
      id: 'previous-session',
      visible: !!(analystState && analystState.insightsFeed.some(i => i.source === 'memory')),
      fixed: true,
      render: () => <PreviousSessionSection onSendMessage={onSendMessage} />,
    },
    {
      id: 'strategic-stance',
      visible: !!analystState?.strategicRecommendation,
      fixed: true,
      render: () => <StrategicStanceSection analystState={analystState!} onSendMessage={onSendMessage} />,
    },
    {
      id: 'health-assessment',
      visible: !!analystState,
      fixed: true,
      render: () => <HealthAssessmentSection analystState={analystState!} onSendMessage={onSendMessage} />,
    },
    // Adaptive sections (reordered by topic relevance + interaction frequency)
    {
      id: 'performance-trajectory',
      visible: hasChartData && !!analystState,
      category: 'analytics',
      render: () => <PerformanceTrajectorySection analystState={analystState!} chartData={chartData} dataKeys={dataKeys} onSendMessage={onSendMessage} />,
    },
    {
      id: 'strategic-divergence',
      visible: hasAnomalies && !!analystState,
      category: 'analytics',
      render: () => <StrategicDivergenceSection insights={analystState!.insightsFeed} onSendMessage={onSendMessage} />,
    },
    {
      id: 'content-intelligence',
      visible: hasContentTopics && !!analystState,
      category: 'content',
      render: () => <ContentIntelligenceSection platformData={analystState!.platformData} onSendMessage={onSendMessage} />,
    },
    {
      id: 'keyword-landscape',
      visible: hasKeywordTopics && !!analystState,
      category: 'keywords',
      render: () => <KeywordLandscapeSection topics={analystState!.topics} platformData={analystState!.platformData} onSendMessage={onSendMessage} />,
    },
    {
      id: 'campaign-pulse',
      visible: hasCampaigns && !!analystState,
      category: 'campaigns',
      render: () => <CampaignPulseSection platformData={analystState!.platformData} onSendMessage={onSendMessage} />,
    },
    {
      id: 'engagement-metrics',
      visible: hasEngagement && !!analystState,
      category: 'analytics',
      render: () => <EngagementMetricsSection platformData={analystState!.platformData} onSendMessage={onSendMessage} />,
    },
    {
      id: 'competitive-position',
      visible: hasCompetitors && !!analystState,
      category: 'competitors',
      render: () => <CompetitivePositionSection topics={analystState!.topics} onSendMessage={onSendMessage} />,
    },
    {
      id: 'goal-progress',
      visible: hasGoal && !!analystState?.goalProgress,
      render: () => <GoalProgressSection goalProgress={analystState!.goalProgress!} onSendMessage={onSendMessage} />,
    },
    {
      id: 'web-intelligence',
      visible: hasWebSearch && !!analystState,
      render: () => <WebIntelligenceSection webSearchResults={analystState!.webSearchResults} onSendMessage={onSendMessage} />,
    },
  ];

  // Separate fixed and adaptive sections
  const fixedSections = sections.filter(s => s.fixed && s.visible);
  const adaptiveSections = sections.filter(s => !s.fixed && s.visible);

  // Topic-aware relevance scoring + interaction frequency
  const activeCategories = analystState?.topics?.map(t => t.category) || [];
  const interactions = getSectionInteractions();
  adaptiveSections.sort((a, b) => {
    const aRelevance = a.category && activeCategories.includes(a.category as any) ? 10 : 0;
    const bRelevance = b.category && activeCategories.includes(b.category as any) ? 10 : 0;
    const aCount = interactions[a.id] || 0;
    const bCount = interactions[b.id] || 0;
    return (bRelevance + bCount) - (aRelevance + aCount);
  });

  const orderedSections = [...fixedSections, ...adaptiveSections];

  return (
    <div className="space-y-12">
      {orderedSections.map(section => (
        <div key={section.id} onClick={() => !section.fixed && handleSectionClick(section.id)}>
          {section.render()}
        </div>
      ))}

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