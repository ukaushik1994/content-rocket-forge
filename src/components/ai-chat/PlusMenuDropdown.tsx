import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Paperclip, PenLine, BookOpen, BarChart3, Lightbulb, Globe, Image, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlusMenuDropdownProps {
  onAttachFile: () => void;
  onContentWizard: () => void;
  onResearchIntelligence?: () => void;
  onAnalyst?: () => void;
  onAIProposals?: () => void;
  onWebSearch?: () => void;
  onImageGeneration?: () => void;
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
    ...(onWebSearch ? [{
      icon: Globe,
      label: 'Web Search',
      description: 'Search the web for info',
      onClick: onWebSearch,
    }] : []),
    ...(onImageGeneration ? [{
      icon: Image,
      label: 'Generate Image',
      description: 'Create an AI-generated image',
      onClick: onImageGeneration,
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
        className="w-48 p-1 bg-card border-border/50 rounded-lg shadow-lg"
      >
        <div className="space-y-px">
          {menuItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors hover:bg-muted/50 group"
            >
              <item.icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-medium text-foreground truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
