import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystDataCard } from './AnalystDataCard';
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

  return (
    <AnalystSectionWrapper number="05" label="Keyword Landscape" headline={<>Your keyword presence is <span className="text-amber-300">evolving</span></>} delay={0.2}>
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
    </AnalystSectionWrapper>
  );
};
