import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  FileText, Send, BarChart3, Users, Target, 
  PlusCircle, RefreshCw, Megaphone, Mail, 
  Route, ToggleRight, UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionConfig {
  id: string;
  label: string;
  prompt: string;
  icon: React.ElementType;
  variant?: 'default' | 'destructive';
}

interface SidebarActionPanelProps {
  dataSource: string;
  onSendMessage: (message: string) => void;
  onClose?: () => void;
}

const ACTION_CONFIGS: Record<string, ActionConfig[]> = {
  'Content Analytics': [
    { id: 'create_content', label: 'Create Content', prompt: 'Create a new blog post about our top performing topic', icon: FileText },
    { id: 'optimize_seo', label: 'Optimize SEO', prompt: 'Analyze and suggest SEO improvements for my recent content', icon: Target },
    { id: 'schedule_content', label: 'Schedule Post', prompt: 'Help me schedule my content for this week', icon: PlusCircle },
    { id: 'repurpose', label: 'Repurpose Content', prompt: 'Repurpose my best performing content for social media', icon: RefreshCw },
  ],
  'Campaign Intelligence': [
    { id: 'create_campaign', label: 'New Campaign', prompt: 'Help me create a new marketing campaign', icon: Megaphone },
    { id: 'generate_content', label: 'Generate Assets', prompt: 'Generate content assets for my active campaign', icon: FileText },
    { id: 'retry_failed', label: 'Retry Failed', prompt: 'Retry all failed content generation items', icon: RefreshCw },
    { id: 'send_campaign', label: 'Send Campaign', prompt: 'Help me send my email campaign', icon: Send, variant: 'destructive' },
  ],
  'Market Research': [
    { id: 'add_keywords', label: 'Add Keywords', prompt: 'Suggest and add new keywords to track', icon: Target },
    { id: 'run_serp', label: 'SERP Analysis', prompt: 'Run a SERP analysis for my top keywords', icon: BarChart3 },
    { id: 'competitor_analysis', label: 'Analyze Competitors', prompt: 'Analyze my competitors and their content strategies', icon: Users },
    { id: 'topic_cluster', label: 'Topic Cluster', prompt: 'Create a topic cluster from my keyword research', icon: PlusCircle },
  ],
  'AI Analysis': [
    { id: 'create_contact', label: 'Add Contact', prompt: 'Help me add a new contact to my CRM', icon: UserPlus },
    { id: 'create_segment', label: 'Create Segment', prompt: 'Create a new audience segment based on engagement', icon: Users },
    { id: 'create_journey', label: 'Build Journey', prompt: 'Help me create a new customer journey', icon: Route },
    { id: 'toggle_automation', label: 'Manage Automations', prompt: 'Show me my automations and their status', icon: ToggleRight },
  ],
  'Engage': [
    { id: 'create_contact', label: 'Add Contact', prompt: 'Help me add a new contact', icon: UserPlus },
    { id: 'send_email', label: 'Send Email', prompt: 'Help me compose and send a quick email', icon: Mail, variant: 'destructive' },
    { id: 'create_segment', label: 'New Segment', prompt: 'Create a smart audience segment', icon: Users },
    { id: 'create_automation', label: 'New Automation', prompt: 'Help me set up a new automation', icon: ToggleRight },
  ],
};

export const SidebarActionPanel: React.FC<SidebarActionPanelProps> = ({
  dataSource,
  onSendMessage,
  onClose
}) => {
  const actions = useMemo(() => {
    const key = Object.keys(ACTION_CONFIGS).find(k => 
      dataSource.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(dataSource.toLowerCase())
    );
    return ACTION_CONFIGS[key || 'AI Analysis'] || ACTION_CONFIGS['AI Analysis'];
  }, [dataSource]);

  const handleAction = (action: ActionConfig) => {
    onSendMessage(action.prompt);
    onClose?.();
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1.5">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAction(action)}
                    className={cn(
                      "w-9 h-9 rounded-xl transition-all duration-200",
                      action.variant === 'destructive'
                        ? "text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
                        : "text-muted-foreground/60 hover:text-foreground hover:bg-[rgba(255,255,255,0.06)]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  {action.label}
                </TooltipContent>
              </Tooltip>
            </motion.div>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
