import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Paperclip, PenLine, BookOpen, BarChart3, Lightbulb, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlusMenuDropdownProps {
  onAttachFile: () => void;
  onContentWizard: () => void;
  onResearchIntelligence?: () => void;
  onAnalyst?: () => void;
  onAIProposals?: () => void;
  disabled?: boolean;
}

export const PlusMenuDropdown: React.FC<PlusMenuDropdownProps> = ({
  onAttachFile,
  onContentWizard,
  onResearchIntelligence,
  onAnalyst,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: Paperclip,
      label: 'Attach File',
      description: 'Upload a file to analyze',
      onClick: onAttachFile,
    },
    {
      icon: PenLine,
      label: 'Content Wizard',
      description: 'Create content from a topic',
      onClick: onContentWizard,
    },
    ...(onResearchIntelligence ? [{
      icon: BookOpen,
      label: 'Research Intelligence',
      description: 'Plan content strategy & gaps',
      onClick: onResearchIntelligence,
    }] : []),
    ...(onAnalyst ? [{
      icon: BarChart3,
      label: 'Analyst',
      description: 'Charts & insights companion',
      onClick: onAnalyst,
    }] : []),
    ...(onAIProposals ? [{
      icon: Lightbulb,
      label: 'AI Proposals',
      description: 'Generate smart proposals',
      onClick: onAIProposals,
    }] : []),
  ];

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
        className="w-56 p-1.5 bg-card border-border/50 rounded-xl shadow-lg"
      >
        <div className="space-y-0.5">
          {menuItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-muted/50 group"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground/60 truncate">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
