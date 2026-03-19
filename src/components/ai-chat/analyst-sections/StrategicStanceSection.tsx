import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { NarrativePromptCard } from './NarrativePromptCard';
import { AnalystState } from '@/hooks/useAnalystEngine';
import { Target, Zap, ShieldAlert, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  analystState: AnalystState;
  onSendMessage: (message: string) => void;
}

const stanceConfig = {
  'stop-creating': {
    icon: ShieldAlert,
    color: 'text-rose-300',
    bgColor: 'bg-rose-400/10',
    borderColor: 'border-rose-400/20',
  },
  'fix-quality': {
    icon: Target,
    color: 'text-amber-300',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/20',
  },
  'accelerate': {
    icon: Rocket,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20',
  },
  'build-foundation': {
    icon: Zap,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/20',
  },
} as const;

export const StrategicStanceSection: React.FC<Props> = ({ analystState, onSendMessage }) => {
  const rec = analystState.strategicRecommendation;
  if (!rec) return null;

  const config = stanceConfig[rec.stance];
  const Icon = config.icon;

  const getHeadline = () => {
    switch (rec.stance) {
      case 'stop-creating':
        return <>Stop creating. <span className="text-rose-300">Start publishing.</span></>;
      case 'fix-quality':
        return <>Quality first, <span className="text-amber-300">then scale.</span></>;
      case 'accelerate':
        return <>Everything's working. <span className="text-emerald-400/80">Accelerate.</span></>;
      case 'build-foundation':
        return <>Build your <span className="text-cyan-400">foundation</span> first.</>;
    }
  };

  return (
    <AnalystSectionWrapper number="00" label="Strategic Stance" headline={getHeadline()} delay={0}>
      <div className={cn('glass-card p-5 border-l-2', config.borderColor)}>
        <div className="flex items-start gap-3.5">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', config.bgColor)}>
            <Icon className={cn('w-5 h-5', config.color)} />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-xs font-medium text-foreground/80 leading-relaxed">{rec.reasoning}</p>
            {rec.actions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {rec.actions.map((action, i) => (
                  <span
                    key={i}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium',
                      config.bgColor, config.color
                    )}
                  >
                    {action.effort === 'low' && '⚡'}
                    {action.effort === 'medium' && '🔧'}
                    {action.effort === 'high' && '🏗️'}
                    {action.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <NarrativePromptCard
        question={rec.promptQuestion}
        primaryLabel={rec.actions[0]?.label || 'Take Action'}
        primaryAction={rec.actions[0]?.prompt || 'What should I focus on right now?'}
        secondaryLabel={rec.actions[1]?.label || 'Tell Me More'}
        secondaryAction={rec.actions[1]?.prompt || 'Explain your strategic recommendation in detail'}
        onSendMessage={onSendMessage}
      />
    </AnalystSectionWrapper>
  );
};