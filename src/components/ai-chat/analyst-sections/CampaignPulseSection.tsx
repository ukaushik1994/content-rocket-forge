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
  const campaignCount = platformData.find(d => d.label === 'Active Campaigns')?.value || 0;
  const queueFailed = platformData.find(d => d.label === 'Queue Failed')?.value || 0;
  const avgSeo = platformData.find(d => d.label === 'Avg SEO Score')?.value || 0;
  const hasData = campaignMetrics.length > 0;

  const getHeadline = () => {
    if (!hasData) return <>Campaigns <span className="text-muted-foreground/60">not started</span></>;
    if (campaignCount === 0) return <>Campaigns are <span className="text-muted-foreground/60">idle</span></>;
    if (queueFailed > 0) return <><span className="text-primary/50">{queueFailed} failure{queueFailed > 1 ? 's' : ''}</span> in queue</>;
    return <>Campaigns are <span className="text-primary/80">operational</span>{avgSeo > 0 && <span className="text-muted-foreground/50 text-sm ml-1.5">· avg SEO {avgSeo}</span>}</>;
  };

  return (
    <AnalystSectionWrapper
      number="06"
      label="CAMPAIGN PULSE"
      headline={getHeadline()}
      delay={0.22}
    >
      {hasData ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {campaignMetrics.slice(0, 4).map((metric) => (
              <AnalystDataCard
                key={metric.label}
                label={metric.label.toUpperCase()}
                value={metric.value}
                onClick={() => onSendMessage(`Show me details about ${metric.label.toLowerCase()}`)}
              />
            ))}
          </div>
          {queueFailed > 0 ? (
            <NarrativePromptCard
              question={`${queueFailed} item${queueFailed > 1 ? 's' : ''} failed in the generation queue. Want to retry or investigate?`}
              primaryLabel="Retry Failed Items"
              primaryAction={`Retry the ${queueFailed} failed items in my content generation queue`}
              secondaryLabel="Show Details"
              secondaryAction="Show me details about the failed queue items and why they failed"
              onSendMessage={onSendMessage}
            />
          ) : (
            <NarrativePromptCard
              question="Want a full campaign health report?"
              primaryLabel="Full Report"
              primaryAction="Give me a comprehensive campaign health overview with metrics and recommendations"
              onSendMessage={onSendMessage}
            />
          )}
        </>
      ) : (
        <NarrativePromptCard
          question="No campaigns created yet. Want to launch your first campaign?"
          primaryLabel="Create Campaign"
          primaryAction="Help me create my first content campaign with a clear goal and strategy"
          secondaryLabel="Learn More"
          secondaryAction="Explain how campaigns work and how they can help my content strategy"
          onSendMessage={onSendMessage}
        />
      )}
    </AnalystSectionWrapper>
  );
};
