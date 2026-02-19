import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Zap, ChevronDown, 
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
  const [isExpanded, setIsExpanded] = React.useState(false);

  const actions = useMemo(() => {
    // Match data source to action config
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
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between cursor-pointer group py-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Quick Actions</h3>
            <Badge variant="outline" className="text-xs text-muted-foreground">{actions.length}</Badge>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          </motion.div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <motion.div 
          className="mt-3 grid grid-cols-2 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Button
                  variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleAction(action)}
                  className={cn(
                    "w-full h-9 text-xs gap-1.5 justify-start",
                    action.variant !== 'destructive' && "border-border/20 hover:border-border/40 hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{action.label}</span>
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
};
