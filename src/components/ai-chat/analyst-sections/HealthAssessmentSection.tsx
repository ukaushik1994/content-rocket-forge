import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystDataCard } from './AnalystDataCard';
import { NarrativePromptCard } from './NarrativePromptCard';
import { AnalystState } from '@/hooks/useAnalystEngine';

interface Props {
  analystState: AnalystState;
  onSendMessage: (message: string) => void;
}

export const HealthAssessmentSection: React.FC<Props> = ({ analystState, onSendMessage }) => {
  const health = analystState.healthScore;
  if (!health) return null;

  const getHeadline = () => {
    if (health.total >= 80) return <>Your workspace is <span className="text-primary/80">thriving</span></>;
    if (health.total >= 60) return <>Health is <span className="text-primary/80">steady</span> — room to grow</>;
    if (health.total >= 40) return <>Performance needs <span className="text-primary/80">attention</span></>;
    return <>Critical areas require <span className="text-primary/50">immediate action</span></>;
  };

  const trendLabel = health.trend === 'improving' ? 'Improving' : health.trend === 'declining' ? 'Declining' : 'Stable';
  const stage = analystState.userStage;
  const bench = analystState.benchmarks;

  return (
    <AnalystSectionWrapper number="01" label="Health Assessment" headline={getHeadline()} delay={0.05}>
      <div className="grid grid-cols-2 gap-3">
        <AnalystDataCard
          label="Health Score"
          value={health.total}
          trend={health.trend === 'improving' ? 'up' : health.trend === 'declining' ? 'down' : 'neutral'}
          trendValue={trendLabel}
          progress={health.total}
          color={health.total >= 70 ? 'green' : health.total >= 40 ? 'amber' : 'red'}
        />
        <AnalystDataCard
          label="Factors Passing"
          value={`${health.factors.filter(f => f.status === 'good').length}/${health.factors.length}`}
          subtitle={health.topCritical ? `⚡ ${health.topCritical}` : 'All clear'}
        />
      </div>

      {stage && bench && (
        <div className="glass-card px-4 py-2.5">
          <p className="text-[10px] text-muted-foreground/50">
            Stage: <span className="text-foreground/60 font-medium capitalize">{stage}</span>
            {' · '}Benchmark: {bench.avgSeo} SEO, {bench.weeklyArticles} articles/week
          </p>
        </div>
      )}

      <div className="glass-card p-4 space-y-2.5">
        {health.factors.map((factor) => (
          <div key={factor.name} className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground/60 truncate flex-1">{factor.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-muted/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    factor.status === 'good' ? 'bg-primary/50' :
                    factor.status === 'warning' ? 'bg-primary/40' : 'bg-rose-300/50'
                  }`}
                  style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground/40 w-7 text-right">{factor.score}/{factor.maxScore}</span>
            </div>
          </div>
        ))}
      </div>

      {health.total < 50 && (
        <NarrativePromptCard
          question={`Your health score is ${health.total}/100${health.topCritical ? ` — "${health.topCritical}" is the most critical factor` : ''}. Want me to create a recovery plan?`}
          primaryLabel={health.topCritical ? `Fix ${health.topCritical}` : 'Build Recovery Plan'}
          primaryAction={health.topCritical ? `Create a step-by-step plan to fix my ${health.topCritical.toLowerCase()} and improve my health score from ${health.total}` : 'Create a step-by-step plan to improve my workspace health score'}
          secondaryLabel="Show Details"
          secondaryAction="Break down each health factor and explain what's wrong"
          onSendMessage={onSendMessage}
        />
      )}
    </AnalystSectionWrapper>
  );
};
