import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="mt-3"
    >
      <Card className="bg-muted/20 border border-border/30 p-4">
        <p className="text-xs text-muted-foreground mb-3">
          How would you like to create content{keyword ? ` about "${keyword}"` : ''}?
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onStartFromScratch}
            className="flex-1 gap-2 border-border/40 hover:border-primary/50 hover:bg-primary/5"
          >
            <PenLine className="h-4 w-4" />
            Start from Scratch
          </Button>
          <Button
            size="sm"
            onClick={onAIProposals}
            className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            AI Proposals
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
