import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  TrendingUp, 
  Target,
  BarChart3,
  Lightbulb,
  Settings,
  Zap
} from 'lucide-react';

interface EnhancedQuickActionsProps {
  onAction: (action: string, data?: any) => void;
}

export const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({ onAction }) => {
  const quickActions = [
    {
      id: 'keyword-optimization',
      title: 'Keyword Optimization',
      description: 'Find high-impact keywords and optimize your content',
      icon: Search,
      action: 'workflow:keyword-optimization'
    },
    {
      id: 'content-creation',
      title: 'Content Creation',
      description: 'Create high-performing content with AI assistance',
      icon: FileText,
      action: 'workflow:content-creation'
    },
    {
      id: 'performance-analysis',
      title: 'Performance Analysis',
      description: 'Analyze your content metrics and get optimization tips',
      icon: BarChart3,
      action: 'workflow:performance-analysis'
    },
    {
      id: 'solution-integration',
      title: 'Solution Integration',
      description: 'Better integrate your solutions into content strategy',
      icon: Target,
      action: 'workflow:solution-integration'
    }
  ];

  const suggestions = [
    {
      text: "What's my content performance this month?",
      displayText: "What's my content performance this month?",
      action: 'send:Show me my content performance analytics for this month'
    },
    {
      text: "Find keyword opportunities",
      displayText: "Find keyword opportunities",
      action: 'send:Help me find high-opportunity keywords for my solutions'
    },
    {
      text: "Optimize existing content",
      displayText: "Optimize existing content",
      action: 'send:Analyze my existing content and suggest optimizations'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Primary Actions */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <Card 
                className="cursor-pointer transition-all duration-200 bg-card border-border/50 hover:border-primary/30 group"
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
          Popular Questions
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
                onClick={() => onAction(suggestion.action, { displayText: suggestion.displayText })}
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
