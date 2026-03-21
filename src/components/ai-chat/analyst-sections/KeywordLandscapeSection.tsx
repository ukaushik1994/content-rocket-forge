import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystDataCard } from './AnalystDataCard';
import { NarrativePromptCard } from './NarrativePromptCard';
import { AnalystTopic, PlatformDataPoint } from '@/hooks/useAnalystEngine';

interface Props {
  topics: AnalystTopic[];
  platformData: PlatformDataPoint[];
  onSendMessage: (message: string) => void;
}

export const KeywordLandscapeSection: React.FC<Props> = ({ topics, platformData, onSendMessage }) => {
  const keywordTopics = topics.filter(t => t.category === 'keywords');
  const keywordMetrics = platformData.filter(d => d.category === 'keywords');

  const trackedKw = platformData.find(m => m.label === 'Tracked Keywords')?.value || 0;
  const kwProposals = platformData.find(m => m.label === 'Keyword Proposals')?.value || 0;
  const hasData = trackedKw > 0 || kwProposals > 0 || keywordTopics.length > 0;

  const getHeadline = () => {
    if (trackedKw > 0) return <><span className="text-emerald-400/80">{trackedKw} keyword{trackedKw !== 1 ? 's' : ''}</span> tracked</>;
    if (kwProposals > 0) return <><span className="text-primary/80">{kwProposals} proposal{kwProposals !== 1 ? 's' : ''}</span> available</>;
    return <>Keyword presence is a <span className="text-rose-300">blind spot</span></>;
  };

  return (
    <AnalystSectionWrapper number="05" label="Keyword Landscape" headline={getHeadline()} delay={0.2}>
      {keywordMetrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {keywordMetrics.slice(0, 4).map((metric) => (
            <AnalystDataCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      )}
      {keywordTopics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywordTopics.map((topic) => (
            <button
              key={topic.name}
              onClick={() => onSendMessage(`Analyze keyword performance for "${topic.name}"`)}
              className="px-3.5 py-2 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.06] text-muted-foreground/70 hover:bg-white/[0.08] hover:text-foreground transition-colors"
            >
              {topic.name} {topic.mentionCount > 1 && <span className="text-muted-foreground/40">×{topic.mentionCount}</span>}
            </button>
          ))}
        </div>
      )}
      {!hasData && (
        <NarrativePromptCard
          question="No keywords tracked yet. Want me to auto-detect keywords from your content?"
          primaryLabel="Auto-Detect Keywords"
          primaryAction="Analyze my existing content and auto-detect keyword targets"
          secondaryLabel="I'll Add Manually"
          secondaryAction=""
          onSendMessage={onSendMessage}
        />
      )}
    </AnalystSectionWrapper>
  );
};
