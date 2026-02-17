import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search,
  Target,
  BarChart3,
  Users,
  Shuffle,
  Lightbulb,
  Zap
} from 'lucide-react';

interface EnhancedQuickActionsProps {
  onAction: (action: string, data?: any) => void;
}

export const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({ onAction }) => {
  const quickActions = [
    {
      id: 'content-creation',
      title: 'Write Content',
      description: "Draft articles, social posts, emails — I'll write and save them directly",
      icon: FileText,
      action: 'workflow:content-creation'
    },
    {
      id: 'keyword-optimization',
      title: 'Research Keywords',
      description: 'Find, analyze, and add keywords to your library automatically',
      icon: Search,
      action: 'workflow:keyword-optimization'
    },
    {
      id: 'solution-management',
      title: 'Manage Solutions',
      description: 'Add products, update offerings, link them to your content',
      icon: Target,
      action: 'workflow:solution-management'
    },
    {
      id: 'campaign-intelligence',
      title: 'Campaign Intelligence',
      description: 'Track queue health, view dashboards, retry failed content in real-time',
      icon: BarChart3,
      action: 'workflow:campaign-intelligence'
    },
    {
      id: 'engage-actions',
      title: 'Engage CRM',
      description: 'Create contacts, draft emails, manage segments and automations',
      icon: Users,
      action: 'workflow:engage-actions'
    },
    {
      id: 'cross-module',
      title: 'Cross-Module Actions',
      description: 'Promote content to campaigns, repurpose across formats automatically',
      icon: Shuffle,
      action: 'workflow:cross-module'
    }
  ];

  const suggestions = [
    {
      text: 'Write a blog post about my solution',
      action: 'send:Write a blog post about my top solution'
    },
    {
      text: 'Show my campaign dashboard',
      action: 'send:Show me my campaign dashboard with live queue status'
    },
    {
      text: 'Add keywords to my library',
      action: 'send:Research and add high-opportunity keywords to my library'
    },
    {
      text: 'Draft an email for my latest content',
      action: 'send:Draft a promotional email for my most recent published content'
    },
    {
      text: 'What content is failing? Fix it',
      action: 'send:Show me any failed content in my queue and retry them'
    },
    {
      text: 'Create a contact segment',
      action: 'send:Create a new contact segment for my leads'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Primary Actions */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          What I Can Do For You
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <Card 
                className="cursor-pointer transition-all duration-200 bg-card border-border/50 hover:border-primary/30 group h-full"
                onClick={() => onAction(action.action, { displayText: action.title })}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors text-sm">
                        {action.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Suggestions */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Try Asking
        </h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + (0.05 * index), duration: 0.2 }}
            >
              <Badge 
                variant="outline" 
                className="cursor-pointer px-3 py-1.5 text-xs bg-card border-border/50 hover:border-primary/30 transition-all duration-200 text-muted-foreground hover:text-foreground"
                onClick={() => onAction(suggestion.action, { displayText: suggestion.text })}
              >
                {suggestion.text}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
