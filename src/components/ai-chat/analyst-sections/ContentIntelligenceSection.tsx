import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystDataCard } from './AnalystDataCard';
import { PlatformDataPoint } from '@/hooks/useAnalystEngine';

interface Props {
  platformData: PlatformDataPoint[];
  onSendMessage: (message: string) => void;
}

export const ContentIntelligenceSection: React.FC<Props> = ({ platformData, onSendMessage }) => {
  const contentMetrics = platformData.filter(d => d.category === 'content');
  if (contentMetrics.length === 0) return null;

  return (
    <AnalystSectionWrapper number="04" label="Content Intelligence" headline={<>Your content pipeline is <span className="text-emerald-400/80">active</span></>} delay={0.18}>
      <div className="grid grid-cols-2 gap-3">
        {contentMetrics.slice(0, 4).map((metric) => (
          <AnalystDataCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            onClick={() => onSendMessage(`Analyze my ${metric.label.toLowerCase()} in detail`)}
          />
        ))}
      </div>
    </AnalystSectionWrapper>
  );
};
