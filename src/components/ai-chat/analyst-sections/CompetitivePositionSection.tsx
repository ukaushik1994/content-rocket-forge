import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystInsightCard } from './AnalystInsightCard';
import { NarrativePromptCard } from './NarrativePromptCard';
import { AnalystTopic, PlatformDataPoint } from '@/hooks/useAnalystEngine';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  topics: AnalystTopic[];
  platformData?: PlatformDataPoint[];
  onSendMessage: (message: string) => void;
}

export const CompetitivePositionSection: React.FC<Props> = ({ topics, platformData = [], onSendMessage }) => {
  const competitorData = platformData
    .filter(d => d.category === 'competitors' && d.label.startsWith('Competitor: '))
    .map(d => ({
      name: d.label.replace('Competitor: ', ''),
      strengths: (d.metadata?.strengths as string[]) || [],
      weaknesses: (d.metadata?.weaknesses as string[]) || [],
      lastAnalyzedAt: d.metadata?.lastAnalyzedAt as string | null,
      marketPosition: d.metadata?.marketPosition as string | null,
    }));
  const trackedCount = platformData.find(d => d.label === 'Tracked Competitors')?.value || 0;

  const competitorTopics = topics.filter(t => t.category === 'competitors');

  const hasData = competitorData.length > 0 || competitorTopics.length > 0;

  const getHeadline = () => {
    if (competitorData.length > 0) return <><span className="text-emerald-400/80">{trackedCount}</span> competitor{trackedCount !== 1 ? 's' : ''} tracked</>;
    if (competitorTopics.length > 0) return <><span className="text-primary/80">{competitorTopics.length} signal{competitorTopics.length > 1 ? 's' : ''}</span> detected</>;
    return <>Competitive landscape is a <span className="text-rose-300">blind spot</span></>;
  };

  const getCompetitorDescription = (comp: typeof competitorData[0]) => {
    const parts: string[] = [];
    if (comp.strengths.length > 0) parts.push(`+${comp.strengths.length} strengths`);
    if (comp.weaknesses.length > 0) parts.push(`-${comp.weaknesses.length} weaknesses`);
    if (comp.lastAnalyzedAt) {
      try {
        parts.push(`analyzed ${formatDistanceToNow(new Date(comp.lastAnalyzedAt), { addSuffix: true })}`);
      } catch { /* ignore parse errors */ }
    }
    if (parts.length === 0 && comp.marketPosition) return comp.marketPosition;
    return parts.join(' · ') || 'Tracked competitor';
  };

  const getCompetitorDotColor = (comp: typeof competitorData[0]): 'green' | 'amber' | 'red' => {
    if (comp.strengths.length > 0 && comp.weaknesses.length > 0) return 'green';
    if (comp.lastAnalyzedAt) return 'green';
    return 'amber';
  };

  return (
    <AnalystSectionWrapper
      number="08"
      label="Competitive Position"
      headline={getHeadline()}
      delay={0.26}
    >
      {competitorData.length > 0 ? (
        <div className="space-y-2.5">
          {competitorData.map((comp) => (
            <AnalystInsightCard
              key={comp.name}
              title={comp.name}
              description={getCompetitorDescription(comp)}
              dotColor={getCompetitorDotColor(comp)}
              onExplore={() => onSendMessage(`Give me a competitive analysis against ${comp.name}`)}
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
      {hasData && competitorData.length <= 1 && competitorTopics.length === 0 && (
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
