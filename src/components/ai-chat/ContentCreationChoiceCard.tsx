import React from 'react';
import { motion } from 'framer-motion';
import { PenLine, Sparkles } from 'lucide-react';

interface ContentCreationChoiceCardProps {
  keyword: string;
  onStartFromScratch: () => void;
  onAIProposals: () => void;
}

export const ContentCreationChoiceCard: React.FC<ContentCreationChoiceCardProps> = ({
  keyword,
  onStartFromScratch,
  onAIProposals
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.25 }}
      className="mt-2"
    >
      <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-full p-1.5 pl-3">
        <span className="text-[11px] text-muted-foreground">
          {keyword ? `"${keyword}"` : 'Create content'}
        </span>
        <button
          onClick={onStartFromScratch}
          className="inline-flex items-center gap-1.5 text-xs text-foreground/80 hover:text-foreground py-1.5 px-3 rounded-full border border-white/[0.08] hover:bg-white/[0.06] transition-colors"
        >
          <PenLine className="h-3 w-3" />
          Scratch
        </button>
        <button
          onClick={onAIProposals}
          className="inline-flex items-center gap-1.5 text-xs text-primary-foreground py-1.5 px-3 rounded-full bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary transition-all"
        >
          <Sparkles className="h-3 w-3" />
          AI Proposals
        </button>
      </div>
    </motion.div>
  );
};
