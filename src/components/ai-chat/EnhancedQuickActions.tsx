import React, { useMemo } from 'react';
import { PenTool, Search, Megaphone, Mail, BarChart3, HelpCircle, FileText, PartyPopper } from 'lucide-react';

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
        priority: 1,
      });
    } else if (draftCount > 5) {
      items.push({
        text: `Review ${draftCount} drafts`,
        prompt: `I have ${draftCount} draft articles. Show me the ones closest to being ready to publish.`,
        icon: FileText,
        priority: 1,
      });
    }

    // 3. Milestone celebrations
    if (publishedCount === 10 || publishedCount === 25 || publishedCount === 50 || publishedCount === 100) {
      items.push({
        text: `🎉 ${publishedCount} articles published!`,
        prompt: `I just hit ${publishedCount} published articles! Show me my content performance and what's working best.`,
        icon: PartyPopper,
        priority: 1,
      });
    }

    // 4. Contextual defaults (fill remaining slots)
    const defaults = [
      { text: 'Write content', prompt: 'I want to write a new blog post. What topic should I write about?', directWizard: true, icon: PenTool, priority: 2 },
      { text: 'Research keywords', prompt: 'Help me research and find the best keywords for my niche', icon: Search, priority: 2 },
      { text: 'Run a campaign', prompt: 'Help me set up and run a new campaign', icon: Megaphone, priority: 2 },
      { text: 'Draft an email', prompt: 'Create a new email campaign for my latest content', icon: Mail, priority: 2 },
      { text: 'Check performance', prompt: 'Show me my campaign dashboard with live queue status', icon: BarChart3, priority: 2 },
      { text: 'What can you do?', prompt: '/help', icon: HelpCircle, priority: 3 },
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
      className="space-y-px w-full"
      role="group"
      aria-label="Quick actions"
    >
      {actions.map((item) => (
        <button
          key={item.text}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors hover:bg-muted/50 group"
          onClick={() => handleClick(item)}
        >
          <item.icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-xs font-medium text-foreground truncate">{item.text}</span>
        </button>
      ))}
    </div>
  );
};
