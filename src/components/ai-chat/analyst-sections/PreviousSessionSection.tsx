import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { NarrativePromptCard } from './NarrativePromptCard';

interface Props {
  onSendMessage: (message: string) => void;
}

export const PreviousSessionSection: React.FC<Props> = ({ onSendMessage }) => {
  return (
    <AnalystSectionWrapper
      number="10"
      label="PREVIOUS SESSION"
      headline={<>Continuing from your <span className="text-primary/80">last session</span></>}
      delay={0}
    >
      <NarrativePromptCard
        question="I remember context from your previous conversation. Want to pick up where you left off?"
        primaryLabel="Continue"
        primaryAction="Continue from where we left off in my previous session"
        secondaryLabel="Start Fresh"
        secondaryAction="Start a fresh analysis — ignore previous session context"
        onSendMessage={onSendMessage}
      />
    </AnalystSectionWrapper>
  );
};
