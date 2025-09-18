import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuggestionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

export const SuggestionButton = ({ onClick, disabled = false, size = 'sm' }: SuggestionButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="outline"
        size={size}
        className="ml-2 h-6 w-6 p-0 rounded-full bg-primary/10 hover:bg-primary/20 border-primary/30"
      >
        <Sparkles className="h-3 w-3 text-primary" />
      </Button>
    </motion.div>
  );
};