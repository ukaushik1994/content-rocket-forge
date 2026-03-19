import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystInsightCard } from './AnalystInsightCard';
import { AnalystTopic } from '@/hooks/useAnalystEngine';

interface Props {
  topics: AnalystTopic[];
  onSendMessage: (message: string) => void;
}

export const CompetitivePositionSection: React.FC<Props> = ({ topics, onSendMessage }) => {
  const competitorTopics = topics.filter(t => t.category === 'competitors');
  if (competitorTopics.length === 0) return null;

  return (
    <AnalystSectionWrapper
      number="08"
      label="Competitive Position"
      headline={<>Competitor landscape is <span className="text-amber-300">shifting</span></>}
      delay={0.26}
    >
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
    </AnalystSectionWrapper>
  );
};
