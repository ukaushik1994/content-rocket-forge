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
    <div className="glass-card p-3 border-l-2 border-primary/30">
      <p className="text-[11px] text-foreground/60 italic mb-2 leading-relaxed">{question}</p>
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => onSendMessage(primaryAction)}
          className="w-full px-3 py-1.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-primary/80 to-primary text-primary-foreground hover:from-primary/90 hover:to-primary transition-all"
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
            className="w-full px-3 py-1.5 rounded-full text-[11px] font-medium border border-white/10 text-foreground/50 hover:text-foreground/80 hover:border-white/20 transition-all"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
};
