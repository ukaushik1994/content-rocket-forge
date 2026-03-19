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
    <div className="glass-card p-5 border-l-2 border-cyan-400/40">
      <p className="text-xs text-foreground/60 italic mb-4 leading-relaxed">{question}</p>
      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => onSendMessage(primaryAction)}
          className="w-full px-4 py-2.5 rounded-full text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          {primaryLabel}
        </button>
        {secondaryLabel && secondaryAction && (
          <button
            onClick={() => onSendMessage(secondaryAction)}
            className="w-full px-4 py-2.5 rounded-full text-xs font-medium border border-white/15 text-foreground/60 hover:text-foreground hover:border-white/25 transition-colors"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
};
