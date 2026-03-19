import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystState } from '@/hooks/useAnalystEngine';

interface Props {
  analystState: AnalystState | null;
  deepDivePrompts: string[];
  onSendMessage: (message: string) => void;
}

const defaultPrompts = [
  'Show content performance',
  'Campaign health overview',
  'Keyword rankings analysis',
  'Content pipeline status',
];

export const ExploreSection: React.FC<Props> = ({ analystState, deepDivePrompts, onSendMessage }) => {
  const prompts: { label: string; action: string }[] = [];

  for (const p of deepDivePrompts.slice(0, 2)) {
    prompts.push({ label: p, action: p });
  }

  if (analystState) {
    for (const topic of analystState.topics.slice(0, 2)) {
      if (!prompts.some(p => p.label.includes(topic.name))) {
        prompts.push({ label: `Deep dive: ${topic.name}`, action: `Give me a detailed analysis of my ${topic.name.toLowerCase()} performance` });
      }
    }
    for (const action of analystState.suggestedActions.slice(0, 2)) {
      prompts.push({ label: action.title, action: action.action || action.title });
    }
  }

  const finalPrompts = prompts.length > 0 ? prompts.slice(0, 6) : defaultPrompts.map(p => ({ label: p, action: p }));

  return (
    <AnalystSectionWrapper number="12" label="Explore" headline={<>Continue exploring your <span className="text-amber-300">data</span></>} delay={0.35}>
      <div className="flex flex-wrap gap-2">
        {finalPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt.action)}
            className="px-3.5 py-2 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.06] text-muted-foreground/70 hover:bg-white/[0.08] hover:text-foreground transition-colors"
          >
            {prompt.label}
          </button>
        ))}
      </div>
    </AnalystSectionWrapper>
  );
};
