import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Search, Megaphone, Mail, BarChart3, HelpCircle, Database } from 'lucide-react';

interface EnhancedQuickActionsProps {
  onAction: (action: string, data?: any) => void;
  onSetVisualization?: (visualData: any) => void;
}

export const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({ onAction, onSetVisualization }) => {
  const suggestions = [
    { text: 'Write content', prompt: 'I want to write a new blog post. What topic should I write about?', directWizard: true, icon: PenTool, iconColor: 'text-purple-400' },
    { text: 'Research keywords', prompt: 'Add keyword "content marketing" and run SERP analysis', icon: Search, iconColor: 'text-amber-400' },
    { text: 'Run a campaign', prompt: 'Help me set up and run a new campaign', icon: Megaphone, iconColor: 'text-emerald-400' },
    { text: 'Draft an email', prompt: 'Create a new email campaign for my latest content', icon: Mail, iconColor: 'text-blue-400' },
    { text: 'Check performance', prompt: 'Show me my campaign dashboard with live queue status', icon: BarChart3, iconColor: 'text-orange-400' },
    { text: 'What can you do?', prompt: '/help', icon: HelpCircle, iconColor: 'text-violet-400' },
  ];

  const handleClick = (item: typeof suggestions[0]) => {
    if (item.directWizard && onSetVisualization) {
      onSetVisualization({
        type: 'content_wizard',
        keyword: '',
      });
      return;
    }
    onAction(`send:${item.prompt}`, { displayText: item.text });
  };

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-[720px]"
      role="group"
      aria-label="Quick actions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      {suggestions.map((item, index) => (
        <motion.button
          key={item.text}
          className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl border border-border/20 bg-card/30 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card/60 hover:border-border/40 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          onClick={() => handleClick(item)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -1 }}
          transition={{ delay: 0.15 + index * 0.04, duration: 0.3 }}
        >
          <item.icon className={`h-4 w-4 ${item.iconColor} shrink-0`} />
          {item.text}
        </motion.button>
      ))}
    </motion.div>
  );
};
