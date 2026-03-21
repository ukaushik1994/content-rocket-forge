import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Paperclip, PenLine, BookOpen, BarChart3, Lightbulb, Globe, Image, X, Search, Megaphone, Mail, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlusMenuDropdownProps {
  onAttachFile: () => void;
  onContentWizard: () => void;
  onResearchIntelligence?: () => void;
  onAnalyst?: () => void;
  onAIProposals?: () => void;
  onWebSearch?: () => void;
  onImageGeneration?: () => void;
  onSendPrompt?: (prompt: string, displayText?: string) => void;
  onSetVisualization?: (visualData: any) => void;
  disabled?: boolean;
}

export const PlusMenuDropdown: React.FC<PlusMenuDropdownProps> = ({
  onAttachFile,
  onContentWizard,
  onResearchIntelligence,
  onAnalyst,
  onAIProposals,
  onWebSearch,
  onImageGeneration,
  onSendPrompt,
  onSetVisualization,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toolItems = [
    {
      icon: Paperclip,
      label: 'Attach File',
      onClick: onAttachFile,
      iconColor: 'text-blue-400',
    },
    {
      icon: PenLine,
      label: 'Content Wizard',
      onClick: onContentWizard,
      iconColor: 'text-purple-400',
    },
    ...(onResearchIntelligence ? [{
      icon: BookOpen,
      label: 'Research Intelligence',
      onClick: onResearchIntelligence,
      iconColor: 'text-rose-400',
    }] : []),
    ...(onAnalyst ? [{
      icon: BarChart3,
      label: 'Analyst',
      onClick: onAnalyst,
      iconColor: 'text-orange-400',
    }] : []),
    ...(onAIProposals ? [{
      icon: Lightbulb,
      label: 'AI Proposals',
      onClick: onAIProposals,
      iconColor: 'text-amber-400',
    }] : []),
    ...(onWebSearch ? [{
      icon: Globe,
      label: 'Web Search',
      onClick: onWebSearch,
      iconColor: 'text-emerald-400',
    }] : []),
    ...(onImageGeneration ? [{
      icon: Image,
      label: 'Generate Image',
      onClick: onImageGeneration,
      iconColor: 'text-cyan-400',
    }] : []),
  ];

  const quickItems = onSendPrompt ? [
    {
      icon: Search,
      label: 'Research keywords',
      onClick: () => onSendPrompt('Help me research and find the best keywords for my niche', 'Research keywords'),
      iconColor: 'text-amber-400',
    },
    {
      icon: Megaphone,
      label: 'Run a campaign',
      onClick: () => onSendPrompt('Help me set up and run a new campaign', 'Run a campaign'),
      iconColor: 'text-emerald-400',
    },
    {
      icon: Mail,
      label: 'Draft an email',
      onClick: () => onSendPrompt('Create a new email campaign for my latest content', 'Draft an email'),
      iconColor: 'text-blue-400',
    },
    {
      icon: HelpCircle,
      label: 'What can you do?',
      onClick: () => onSendPrompt('/help', 'What can you do?'),
      iconColor: 'text-violet-400',
    },
  ] : [];

  const renderItem = (item: typeof toolItems[0], index: number) => (
    <button
      key={index}
      type="button"
      onClick={() => {
        item.onClick();
        setIsOpen(false);
      }}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors hover:bg-accent/5 group"
    >
      <item.icon className={`h-4 w-4 flex-shrink-0 ${item.iconColor}`} />
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground truncate">{item.label}</span>
    </button>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          aria-label="Open tools menu"
          className={cn(
            "text-muted-foreground/60 hover:text-muted-foreground hover:bg-transparent p-2 h-8 w-8 transition-colors",
            isOpen && "text-primary"
          )}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </motion.div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-52 p-1 bg-card border-border/50 rounded-lg shadow-lg"
      >
        <div className="flex flex-col gap-0.5">
          {toolItems.map((item, index) => renderItem(item, index))}
          {quickItems.length > 0 && (
            <>
              <div className="border-t border-border/30 my-1" />
              {quickItems.map((item, index) => renderItem(item, toolItems.length + index))}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
