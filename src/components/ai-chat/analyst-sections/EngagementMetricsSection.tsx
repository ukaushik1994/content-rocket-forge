import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystDataCard } from './AnalystDataCard';
import { PlatformDataPoint } from '@/hooks/useAnalystEngine';

interface Props {
  platformData: PlatformDataPoint[];
  onSendMessage: (message: string) => void;
}

export const EngagementMetricsSection: React.FC<Props> = ({ platformData, onSendMessage }) => {
  const engageMetrics = platformData.filter(d =>
    d.category === 'email' || d.category === 'social' || d.category === 'engage'
  );
  if (engageMetrics.length === 0) return null;

  return (
    <AnalystSectionWrapper
      number="07"
      label="Engagement Metrics"
      headline={<>Audience engagement is <span className="text-amber-300">measurable</span></>}
      delay={0.24}
    >
      <div className="grid grid-cols-2 gap-3">
        {engageMetrics.slice(0, 4).map((metric) => (
          <AnalystDataCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            onClick={() => onSendMessage(`Analyze ${metric.label.toLowerCase()} engagement trends`)}
          />
        ))}
      </div>
    </AnalystSectionWrapper>
  );
};
