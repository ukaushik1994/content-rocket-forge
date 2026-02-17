import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search,
  Target,
  BarChart3,
  Users,
  Shuffle
} from 'lucide-react';

interface EnhancedQuickActionsProps {
  onAction: (action: string, data?: any) => void;
}

export const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({ onAction }) => {
  const quickActions = [
    {
      id: 'content-creation',
      title: 'Write Content',
      description: 'Articles, posts, emails',
      icon: FileText,
      action: 'workflow:content-creation'
    },
    {
      id: 'keyword-optimization',
      title: 'Research Keywords',
      description: 'Find & analyze keywords',
      icon: Search,
      action: 'workflow:keyword-optimization'
    },
    {
      id: 'solution-management',
      title: 'Manage Solutions',
      description: 'Products & offerings',
      icon: Target,
      action: 'workflow:solution-management'
    },
    {
      id: 'campaign-intelligence',
      title: 'Campaigns',
      description: 'Track & optimize',
      icon: BarChart3,
      action: 'workflow:campaign-intelligence'
    },
    {
      id: 'engage-actions',
      title: 'Engage CRM',
      description: 'Contacts & emails',
      icon: Users,
      action: 'workflow:engage-actions'
    },
    {
      id: 'cross-module',
      title: 'Cross-Module',
      description: 'Repurpose & promote',
      icon: Shuffle,
      action: 'workflow:cross-module'
    }
  ];

  const suggestions = [
    { text: 'Write a blog post about my solution', action: 'send:Write a blog post about my top solution' },
    { text: 'Show my campaign dashboard', action: 'send:Show me my campaign dashboard with live queue status' },
    { text: 'Add keywords to my library', action: 'send:Research and add high-opportunity keywords to my library' },
    { text: 'Draft an email for my latest content', action: 'send:Draft a promotional email for my most recent published content' },
    { text: 'What content is failing? Fix it', action: 'send:Show me any failed content in my queue and retry them' },
    { text: 'Create a contact segment', action: 'send:Create a new contact segment for my leads' }
  ];

  return (
    <div className="space-y-4">
      {/* Action Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.25 }}
          >
            <div 
              className="rounded-xl p-4 hover:bg-muted/40 transition-colors cursor-pointer group"
              onClick={() => onAction(action.action, { displayText: action.title })}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                  <action.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {action.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Suggestion Badges */}
      <div className="border-t border-border/40 pt-4">
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + (0.04 * index), duration: 0.2 }}
            >
              <Badge 
                variant="outline" 
                className="cursor-pointer px-3 py-1.5 text-xs bg-transparent border-border/40 hover:bg-muted/40 hover:border-border transition-all text-muted-foreground hover:text-foreground"
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
