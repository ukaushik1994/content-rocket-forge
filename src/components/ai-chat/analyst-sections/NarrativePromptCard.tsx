import React from 'react';
import { cn } from '@/lib/utils';

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
    <div className="glass-card p-4 bg-gradient-to-b from-primary/5 to-transparent">
      <p className="text-xs text-foreground/70 mb-3">{question}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSendMessage(primaryAction)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
        >
          {primaryLabel}
        </button>
        {secondaryLabel && secondaryAction && (
          <button
            onClick={() => onSendMessage(secondaryAction)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
};
