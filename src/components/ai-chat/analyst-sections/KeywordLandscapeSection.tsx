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
  if (keywordTopics.length === 0 && keywordMetrics.length === 0) return null;

  const kwCount = keywordMetrics.find(m => m.label === 'Keyword Proposals')?.value || 0;

  const getHeadline = () => {
    if (kwCount === 0) return <>Keyword presence is a <span className="text-rose-300">blind spot</span></>;
    if (kwCount < 10) return <>Your keyword presence is <span className="text-amber-300">emerging</span></>;
    return <><span className="text-emerald-400/80">{kwCount} targets</span> tracked</>;
  };

  return (
    <AnalystSectionWrapper number="05" label="Keyword Landscape" headline={getHeadline()} delay={0.2}>
      {keywordMetrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {keywordMetrics.slice(0, 2).map((metric) => (
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
      {kwCount === 0 && (
        <NarrativePromptCard
          question="No keyword targets detected yet. Want me to auto-detect keywords from your content?"
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
