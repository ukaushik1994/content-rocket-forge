import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystDataCard } from './AnalystDataCard';
import { NarrativePromptCard } from './NarrativePromptCard';
import { PlatformDataPoint } from '@/hooks/useAnalystEngine';

interface Props {
  platformData: PlatformDataPoint[];
  onSendMessage: (message: string) => void;
}

export const ContentIntelligenceSection: React.FC<Props> = ({ platformData, onSendMessage }) => {
  const contentMetrics = platformData.filter(d => d.category === 'content');
  if (contentMetrics.length === 0) return null;

  const totalContent = platformData.find(d => d.label === 'Total Content')?.value || 0;
  const published = platformData.find(d => d.label === 'Published')?.value || 0;
  const avgSeo = platformData.find(d => d.label === 'Avg SEO Score')?.value || 0;
  const drafts = platformData.find(d => d.label === 'Drafts')?.value || 0;
  const publishRate = totalContent > 0 ? Math.round((published / totalContent) * 100) : 0;

  const getHeadline = () => {
    if (totalContent === 0) return <>Content pipeline is <span className="text-muted-foreground/60">empty</span></>;
    if (avgSeo > 0 && avgSeo < 40) return <>Content quality needs <span className="text-rose-300">attention</span></>;
    if (publishRate < 30) return <>Many drafts are <span className="text-primary/80">waiting</span></>;
    if (avgSeo >= 70) return <>Content pipeline is <span className="text-emerald-400/80">high quality</span></>;
    return <>Your content pipeline is <span className="text-emerald-400/80">active</span></>;
  };

  return (
    <AnalystSectionWrapper number="04" label="Content Intelligence" headline={getHeadline()} delay={0.18}>
      <div className="grid grid-cols-2 gap-3">
        {totalContent > 0 && (
          <AnalystDataCard
            label="Publish Rate"
            value={`${publishRate}%`}
            subtitle={`${published}/${totalContent} pieces`}
            onClick={() => onSendMessage('Analyze my content publish rate and pipeline status')}
          />
        )}
        {avgSeo > 0 && (
          <AnalystDataCard
            label="Avg SEO Score"
            value={avgSeo}
            color={avgSeo >= 70 ? 'green' : avgSeo >= 40 ? 'amber' : 'red'}
            onClick={() => onSendMessage('Analyze my content SEO scores in detail')}
          />
        )}
        {contentMetrics
          .filter(m => !['Total Content', 'Published', 'Avg SEO Score', 'Drafts'].includes(m.label))
          .slice(0, 2)
          .map((metric) => (
            <AnalystDataCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              onClick={() => onSendMessage(`Analyze my ${metric.label.toLowerCase()} in detail`)}
            />
          ))
        }
      </div>

      {drafts > 5 && (
        <NarrativePromptCard
          question={`You have ${drafts} drafts waiting. Want me to help prioritize which to publish first?`}
          primaryLabel="Prioritize Drafts"
          primaryAction={`Help me prioritize my ${drafts} drafts — which should I publish first based on SEO potential?`}
          secondaryLabel="Dismiss"
          secondaryAction=""
          onSendMessage={onSendMessage}
        />
      )}
    </AnalystSectionWrapper>
  );
};
