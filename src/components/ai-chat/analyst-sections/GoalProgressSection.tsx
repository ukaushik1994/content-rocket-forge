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
    if (goalProgress.status === 'completed') return <>Goal <span className="text-emerald-400/80">achieved</span> 🎉</>;
    if (goalProgress.status === 'nearly_done') return <>Almost <span className="text-emerald-400/80">there</span></>;
    if (goalProgress.percentage > 30) return <>Making <span className="text-primary/80">progress</span></>;
    return <>Goal is <span className="text-primary/80">just starting</span></>;
  };

  return (
    <AnalystSectionWrapper number="09" label="Goal Progress" headline={getHeadline()} delay={0.28}>
      <AnalystDataCard
        label={goalProgress.goalName}
        value={`${goalProgress.percentage}%`}
        progress={goalProgress.percentage}
        color={goalProgress.percentage >= 80 ? 'green' : 'amber'}
        subtitle={`Next: ${goalProgress.nextStep}`}
        onClick={() => onSendMessage(`What's left to complete my goal: ${goalProgress.goalName}?`)}
      />
      {goalProgress.milestones.length > 0 && (
        <div className="glass-card p-4 space-y-2">
          {goalProgress.milestones.map((m, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full ${m.done ? 'bg-primary/50' : 'bg-muted-foreground/20'}`} />
              <span className={`text-[11px] ${m.done ? 'text-muted-foreground/50 line-through' : 'text-foreground/60'}`}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </AnalystSectionWrapper>
  );
};
