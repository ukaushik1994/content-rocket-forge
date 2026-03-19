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
    if (health.total >= 80) return <>Your workspace is <span className="text-emerald-400/80">thriving</span></>;
    if (health.total >= 60) return <>Health is <span className="text-amber-300">steady</span> — room to grow</>;
    if (health.total >= 40) return <>Performance needs <span className="text-amber-300">attention</span></>;
    return <>Critical areas require <span className="text-rose-300">immediate action</span></>;
  };

  const trendLabel = health.trend === 'improving' ? 'Improving' : health.trend === 'declining' ? 'Declining' : 'Stable';

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

      {/* Factor breakdown */}
      <div className="glass-card p-4 space-y-2.5">
        {health.factors.map((factor) => (
          <div key={factor.name} className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground/60 truncate flex-1">{factor.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-muted/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    factor.status === 'good' ? 'bg-amber-300/50' :
                    factor.status === 'warning' ? 'bg-amber-300/40' : 'bg-rose-300/50'
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
          question="Your health score suggests significant gaps. Want me to create a recovery plan?"
          primaryLabel="Build Recovery Plan"
          primaryAction="Create a step-by-step plan to improve my workspace health score"
          secondaryLabel="Show Details"
          secondaryAction="Break down each health factor and explain what's wrong"
          onSendMessage={onSendMessage}
        />
      )}
    </AnalystSectionWrapper>
  );
};
