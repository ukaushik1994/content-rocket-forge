import React from 'react';
import { motion } from 'framer-motion';

interface EnhancedQuickActionsProps {
  onAction: (action: string, data?: any) => void;
}

export const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({ onAction }) => {
  const suggestions = [
    { text: 'Write content', prompt: 'I want to create a new blog post' },
    { text: 'Research keywords', prompt: 'Add keyword "content marketing" and run SERP analysis' },
    { text: 'Run a campaign', prompt: 'Help me set up and run a new campaign' },
    { text: 'Draft an email', prompt: 'Create a new email campaign for my latest content' },
    { text: 'Check performance', prompt: 'Show me my campaign dashboard with live queue status' },
    { text: 'What can you do?', prompt: '/help' },
  ];

  return (
    <motion.div
      className="flex flex-wrap justify-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      {suggestions.map((item, index) => (
        <motion.button
          key={item.text}
          className="px-4 py-2 rounded-full border border-border/40 bg-card/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200 cursor-pointer"
          onClick={() => onAction(`send:${item.prompt}`, { displayText: item.text })}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + index * 0.04, duration: 0.3 }}
        >
          {item.text}
        </motion.button>
      ))}
    </motion.div>
  );
};
