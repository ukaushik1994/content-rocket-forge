import React from 'react';
import { MessageSquare, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TabSwitcherProps {
  activeTab: 'chat' | 'proposals';
  onTabChange: (tab: 'chat' | 'proposals') => void;
}

export const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-2 p-1.5 rounded-xl bg-card/60 backdrop-blur-xl border border-border/50">
        <motion.button
          onClick={() => onTabChange('chat')}
          className={cn(
            'relative px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2',
            activeTab === 'chat'
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {activeTab === 'chat' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary rounded-lg"
              transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
            />
          )}
          <MessageSquare className="w-5 h-5 relative z-10" />
          <span className="relative z-10">AI Chat</span>
        </motion.button>

        <motion.button
          onClick={() => onTabChange('proposals')}
          className={cn(
            'relative px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2',
            activeTab === 'proposals'
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {activeTab === 'proposals' && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary rounded-lg"
              transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
            />
          )}
          <Target className="w-5 h-5 relative z-10" />
          <span className="relative z-10">AI Proposals</span>
        </motion.button>
      </div>
    </div>
  );
};
