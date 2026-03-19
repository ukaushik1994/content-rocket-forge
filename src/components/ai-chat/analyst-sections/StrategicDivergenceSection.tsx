import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystInsightCard } from './AnalystInsightCard';
import { NarrativePromptCard } from './NarrativePromptCard';
import { InsightItem } from '@/hooks/useAnalystEngine';

interface Props {
  insights: InsightItem[];
  onSendMessage: (message: string) => void;
}

const dotColorForType = (type: string): 'green' | 'amber' | 'red' | 'blue' | 'purple' => {
  switch (type) {
    case 'warning': return 'red';
    case 'opportunity': return 'green';
    case 'trend': return 'amber';
    default: return 'purple';
  }
};

export const StrategicDivergenceSection: React.FC<Props> = ({ insights, onSendMessage }) => {
  const anomalies = insights.filter(i => i.type === 'warning' || i.source === 'cross-signal');
  if (anomalies.length === 0) return null;

  const getHeadline = () => {
    if (anomalies.length >= 3) return <>Multiple signals demand <span className="text-rose-300 underline decoration-2 underline-offset-4">triage</span></>;
    if (anomalies.some(a => a.type === 'warning')) return <>An anomaly requires <span className="text-amber-300 underline decoration-2 underline-offset-4">attention</span></>;
    return <>Cross-signals reveal <span className="text-amber-300">divergence</span></>;
  };

  return (
    <AnalystSectionWrapper number="03" label="Strategic Divergence" headline={getHeadline()} delay={0.15}>
      <div className="space-y-2.5">
        {anomalies.slice(0, 4).map((insight) => (
          <AnalystInsightCard
            key={insight.id}
            title={insight.content}
            dotColor={dotColorForType(insight.type)}
            onExplore={() => onSendMessage(`Tell me more about: ${insight.content}`)}
          />
        ))}
      </div>

      {anomalies.some(a => a.type === 'warning') && (
        <NarrativePromptCard
          question={`${anomalies.length} anomal${anomalies.length === 1 ? 'y' : 'ies'} detected${anomalies[0] ? ` — including "${anomalies[0].content.substring(0, 60)}..."` : ''}. Want me to prioritize fixes?`}
          primaryLabel={`Prioritize ${anomalies.length} Issue${anomalies.length > 1 ? 's' : ''}`}
          primaryAction={`Prioritize the ${anomalies.length} most critical issues and suggest fixes for each`}
          secondaryLabel="Dismiss"
          secondaryAction=""
          onSendMessage={onSendMessage}
        />
      )}
    </AnalystSectionWrapper>
  );
};
