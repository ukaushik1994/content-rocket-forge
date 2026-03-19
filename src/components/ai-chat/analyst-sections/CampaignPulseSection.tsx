import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystDataCard } from './AnalystDataCard';
import { NarrativePromptCard } from './NarrativePromptCard';
import { PlatformDataPoint } from '@/hooks/useAnalystEngine';

interface Props {
  platformData: PlatformDataPoint[];
  onSendMessage: (message: string) => void;
}

export const CampaignPulseSection: React.FC<Props> = ({ platformData, onSendMessage }) => {
  const campaignMetrics = platformData.filter(d => d.category === 'campaigns');
  if (campaignMetrics.length === 0) return null;

  const total = campaignMetrics.reduce((sum, m) => sum + m.value, 0);

  return (
    <AnalystSectionWrapper
      number="06"
      label="Campaign Pulse"
      headline={<>Campaigns are <span className="text-emerald-400">in motion</span></>}
      delay={0.22}
    >
      <div className="grid grid-cols-2 gap-2.5">
        {campaignMetrics.slice(0, 4).map((metric) => (
          <AnalystDataCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            onClick={() => onSendMessage(`Show me details about ${metric.label.toLowerCase()}`)}
          />
        ))}
      </div>
      <NarrativePromptCard
        question="Want a full campaign health report?"
        primaryLabel="Full Report"
        primaryAction="Give me a comprehensive campaign health overview with metrics and recommendations"
        onSendMessage={onSendMessage}
      />
    </AnalystSectionWrapper>
  );
};
