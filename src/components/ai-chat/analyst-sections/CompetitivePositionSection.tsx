import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystInsightCard } from './AnalystInsightCard';
import { NarrativePromptCard } from './NarrativePromptCard';
import { AnalystTopic, PlatformDataPoint } from '@/hooks/useAnalystEngine';

interface Props {
  topics: AnalystTopic[];
  platformData?: PlatformDataPoint[];
  onSendMessage: (message: string) => void;
}

export const CompetitivePositionSection: React.FC<Props> = ({ topics, platformData = [], onSendMessage }) => {
  // Real competitors from DB (platform data)
  const competitorNames = platformData
    .filter(d => d.category === 'competitors' && d.label.startsWith('Competitor: '))
    .map(d => d.label.replace('Competitor: ', ''));
  const trackedCount = platformData.find(d => d.label === 'Tracked Competitors')?.value || 0;

  // Fallback to topic-parsed mentions
  const competitorTopics = topics.filter(t => t.category === 'competitors');

  const hasData = competitorNames.length > 0 || competitorTopics.length > 0;

  const getHeadline = () => {
    if (competitorNames.length > 0) return <><span className="text-emerald-400/80">{trackedCount}</span> competitor{trackedCount !== 1 ? 's' : ''} tracked</>;
    if (competitorTopics.length > 0) return <><span className="text-amber-300">{competitorTopics.length} signal{competitorTopics.length > 1 ? 's' : ''}</span> detected</>;
    return <>Competitive landscape is a <span className="text-rose-300">blind spot</span></>;
  };

  return (
    <AnalystSectionWrapper
      number="08"
      label="Competitive Position"
      headline={getHeadline()}
      delay={0.26}
    >
      {competitorNames.length > 0 ? (
        <div className="space-y-2.5">
          {competitorNames.map((name) => (
            <AnalystInsightCard
              key={name}
              title={name}
              description="Tracked competitor"
              dotColor="green"
              onExplore={() => onSendMessage(`Give me a competitive analysis against ${name}`)}
            />
          ))}
        </div>
      ) : competitorTopics.length > 0 ? (
        <div className="space-y-2.5">
          {competitorTopics.map((topic) => (
            <AnalystInsightCard
              key={topic.name}
              title={topic.name}
              description={`Mentioned ${topic.mentionCount} time${topic.mentionCount > 1 ? 's' : ''} this session`}
              dotColor="amber"
              onExplore={() => onSendMessage(`Give me a competitive analysis against ${topic.name}`)}
            />
          ))}
        </div>
      ) : null}

      {!hasData && (
        <NarrativePromptCard
          question="No competitors tracked yet. Want me to discover competitors in your space?"
          primaryLabel="Find Competitors"
          primaryAction="Discover and analyze my top competitors based on my content and keywords"
          secondaryLabel="I'll Add Later"
          secondaryAction=""
          onSendMessage={onSendMessage}
        />
      )}
      {hasData && competitorNames.length <= 1 && (
        <NarrativePromptCard
          question="Limited competitor data. Want me to discover more competitors?"
          primaryLabel="Find More"
          primaryAction="Discover and analyze my top competitors based on my content and keywords"
          secondaryLabel="Skip"
          secondaryAction=""
          onSendMessage={onSendMessage}
        />
      )}
    </AnalystSectionWrapper>
  );
};
