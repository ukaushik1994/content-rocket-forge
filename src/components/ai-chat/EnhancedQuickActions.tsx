import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Search, Megaphone, Mail, BarChart3, HelpCircle } from 'lucide-react';

interface EnhancedQuickActionsProps {
  onAction: (action: string, data?: any) => void;
  onSetVisualization?: (visualData: any) => void;
}

export const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({ onAction, onSetVisualization }) => {
  const suggestions = [
    { text: 'Write content', prompt: 'I want to write a new blog post. What topic should I write about?', directWizard: true, icon: PenTool, iconColor: 'text-purple-400' },
    { text: 'Research keywords', prompt: 'Help me research and find the best keywords for my niche', icon: Search, iconColor: 'text-amber-400' },
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
    <div
      className="flex flex-col gap-0.5 w-full"
      role="group"
      aria-label="Quick actions"
    >
        <button
          key={item.text}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/5 transition-colors cursor-pointer text-left"
          onClick={() => handleClick(item)}
        >
          <item.icon className={`h-4 w-4 ${item.iconColor} shrink-0`} />
          {item.text}
        </button>
      ))}
    </div>
  );
};
