import React, { useMemo } from 'react';
import { PenTool, Search, Megaphone, Mail, BarChart3, HelpCircle, FileText, Award, PartyPopper, AlertTriangle, Sparkles } from 'lucide-react';

interface EnhancedQuickActionsProps {
  onAction: (action: string, data?: any) => void;
  onSetVisualization?: (visualData: any) => void;
  onClose?: () => void;
  contentCount?: number;
  publishedCount?: number;
  draftCount?: number;
}

export const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({ 
  onAction, 
  onSetVisualization,
  onClose,
  contentCount = -1,
  publishedCount = -1,
  draftCount = -1,
}) => {
  const actions = useMemo(() => {
    const items: Array<{
      text: string;
      prompt: string;
      directWizard?: boolean;
      icon: any;
      priority: number;
    }> = [];

    // 2. State-based actions
    if (contentCount === 0) {
      items.push({
        text: 'Create your first article',
        prompt: 'I want to write my first blog post. What topic should I write about?',
        directWizard: true,
        icon: PenTool,
        iconColor: 'text-emerald-400',
        priority: 1,
      });
    } else if (draftCount > 5) {
      items.push({
        text: `Review ${draftCount} drafts`,
        prompt: `I have ${draftCount} draft articles. Show me the ones closest to being ready to publish.`,
        icon: FileText,
        iconColor: 'text-amber-400',
        priority: 1,
      });
    }

    // 3. Milestone celebrations
    if (publishedCount === 10 || publishedCount === 25 || publishedCount === 50 || publishedCount === 100) {
      items.push({
        text: `🎉 ${publishedCount} articles published!`,
        prompt: `I just hit ${publishedCount} published articles! Show me my content performance and what's working best.`,
        icon: PartyPopper,
        iconColor: 'text-amber-400',
        priority: 1,
      });
    }

    // 4. Contextual defaults (fill remaining slots)
    const defaults = [
      { text: 'Write content', prompt: 'I want to write a new blog post. What topic should I write about?', directWizard: true, icon: PenTool, iconColor: 'text-purple-400', priority: 2 },
      { text: 'Research keywords', prompt: 'Help me research and find the best keywords for my niche', icon: Search, iconColor: 'text-amber-400', priority: 2 },
      { text: 'Run a campaign', prompt: 'Help me set up and run a new campaign', icon: Megaphone, iconColor: 'text-emerald-400', priority: 2 },
      { text: 'Draft an email', prompt: 'Create a new email campaign for my latest content', icon: Mail, iconColor: 'text-blue-400', priority: 2 },
      { text: 'Check performance', prompt: 'Show me my campaign dashboard with live queue status', icon: BarChart3, iconColor: 'text-orange-400', priority: 2 },
      { text: 'What can you do?', prompt: '/help', icon: HelpCircle, iconColor: 'text-violet-400', priority: 3 },
    ];

    // Add defaults that don't duplicate existing items
    const existingTexts = new Set(items.map(i => i.text));
    for (const d of defaults) {
      if (!existingTexts.has(d.text) && items.length < 6) {
        items.push(d);
      }
    }

    return items.slice(0, 6);
  }, [contentCount, publishedCount, draftCount]);

  const handleClick = (item: typeof actions[0]) => {
    if (item.directWizard && onSetVisualization) {
      onSetVisualization({
        type: 'content_wizard',
        keyword: '',
      });
      onClose?.();
      return;
    }
    onAction(`send:${item.prompt}`, { displayText: item.text });
    onClose?.();
  };

  return (
    <div
      className="flex flex-col gap-0.5 w-full"
      role="group"
      aria-label="Quick actions"
    >
      {actions.map((item) => (
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
