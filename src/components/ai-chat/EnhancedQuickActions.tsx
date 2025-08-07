
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
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      action: 'workflow:keyword-optimization'
    },
    {
      id: 'content-creation',
      title: 'Content Creation',
      description: 'Create high-performing content with AI assistance',
      icon: FileText,
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      action: 'workflow:content-creation'
    },
    {
      id: 'performance-analysis',
      title: 'Performance Analysis',
      description: 'Analyze your content metrics and get optimization tips',
      icon: BarChart3,
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      action: 'workflow:performance-analysis'
    },
    {
      id: 'solution-integration',
      title: 'Solution Integration',
      description: 'Better integrate your solutions into content strategy',
      icon: Target,
      color: 'from-orange-500/20 to-red-500/20',
      borderColor: 'border-orange-500/30',
      action: 'workflow:solution-integration'
    }
  ];

  const suggestions = [
    {
      text: "What's my content performance this month?",
      action: 'send:Show me my content performance analytics for this month'
    },
    {
      text: "Find keyword opportunities",
      action: 'send:Help me find high-opportunity keywords for my solutions'
    },
    {
      text: "Optimize existing content",
      action: 'send:Analyze my existing content and suggest optimizations'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-foreground/80" />
          Smart Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-card/70 border-border group overflow-hidden relative`}
                  onClick={() => onAction(action.action)}
                >
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} border ${action.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="h-6 w-6 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2 group-hover:text-foreground transition-colors">
                          {action.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-foreground/5 to-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />
                </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Suggestions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-foreground/80" />
          Popular Questions
        </h3>
        <div className="flex flex-wrap gap-3">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (0.1 * index), duration: 0.4 }}
            >
              <Badge 
                variant="outline" 
                className="cursor-pointer px-4 py-2 text-sm bg-background/70 border-border hover:bg-background/90 transition-all duration-200 text-muted-foreground hover:text-foreground"
                onClick={() => onAction(suggestion.action)}
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
