import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystDataCard } from './AnalystDataCard';
import { GoalProgress } from '@/hooks/useAnalystEngine';

interface Props {
  goalProgress: GoalProgress;
  onSendMessage: (message: string) => void;
}

export const GoalProgressSection: React.FC<Props> = ({ goalProgress, onSendMessage }) => {
  const getHeadline = () => {
    if (goalProgress.status === 'completed') return <>Goal <span className="text-emerald-400">achieved</span> 🎉</>;
    if (goalProgress.status === 'nearly_done') return <>Almost <span className="text-blue-400">there</span></>;
    if (goalProgress.percentage > 30) return <>Making <span className="text-blue-400">progress</span></>;
    return <>Goal is <span className="text-amber-400">just starting</span></>;
  };

  return (
    <AnalystSectionWrapper number="09" label="Goal Progress" headline={getHeadline()} delay={0.28}>
      <AnalystDataCard
        label={goalProgress.goalName}
        value={`${goalProgress.percentage}%`}
        progress={goalProgress.percentage}
        color={goalProgress.percentage >= 80 ? 'green' : goalProgress.percentage >= 40 ? 'blue' : 'amber'}
        subtitle={`Next: ${goalProgress.nextStep}`}
        onClick={() => onSendMessage(`What's left to complete my goal: ${goalProgress.goalName}?`)}
      />
      {goalProgress.milestones.length > 0 && (
        <div className="glass-card p-3 space-y-1.5">
          {goalProgress.milestones.map((m, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${m.done ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
              <span className={`text-[10px] ${m.done ? 'text-muted-foreground line-through' : 'text-foreground/70'}`}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </AnalystSectionWrapper>
  );
};
