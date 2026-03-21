import React from 'react';

interface NarrativePromptCardProps {
  question: string;
  primaryLabel: string;
  primaryAction: string;
  secondaryLabel?: string;
  secondaryAction?: string;
  onSendMessage: (message: string) => void;
}

export const NarrativePromptCard: React.FC<NarrativePromptCardProps> = ({
  question,
  primaryLabel,
  primaryAction,
  secondaryLabel,
  secondaryAction,
  onSendMessage,
}) => {
  return (
    <div className="glass-card p-2.5 border-l-2 border-primary/30">
      <p className="text-[10px] text-foreground/60 italic mb-1.5 leading-relaxed">{question}</p>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onSendMessage(primaryAction)}
          className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-primary/80 to-primary text-primary-foreground hover:from-primary/90 hover:to-primary transition-all"
        >
          {primaryLabel}
        </button>
        {secondaryLabel && (
          <button
            onClick={() => {
              if (secondaryAction && secondaryAction.trim()) {
                onSendMessage(secondaryAction);
              }
            }}
            className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-white/10 text-foreground/50 hover:text-foreground/80 hover:border-white/20 transition-all"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
};
