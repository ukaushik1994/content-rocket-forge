import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';

const THINKING_PHRASES = [
  "Analyzing your request...",
  "Crafting a response...",
  "Pulling it together...",
  "Connecting the dots...",
  "Almost there...",
  "Thinking deeply...",
  "Working on it...",
  "Processing...",
];

export const ThinkingTextRotator: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % THINKING_PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 max-w-4xl mx-auto"
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-transparent border border-border/20 flex items-center justify-center">
          <Brain className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <Card className="flex items-center gap-3 text-muted-foreground text-sm px-4 py-3 bg-transparent border border-border/20">
        <div className="flex gap-1">
          <motion.div
            className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          />
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-sm"
          >
            {THINKING_PHRASES[index]}
          </motion.span>
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
