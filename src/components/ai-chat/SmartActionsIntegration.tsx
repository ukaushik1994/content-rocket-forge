import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SmartActionBar } from '@/components/smart-actions/SmartActionBar';
import { 
  Zap, 
  Target, 
  BarChart3, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SmartContext, SmartRecommendation } from '@/services/smart-actions/types';

interface SmartActionsIntegrationProps {
  onAction?: (action: string) => void;
  context?: SmartContext;
  recommendation?: SmartRecommendation;
}

export const SmartActionsIntegration: React.FC<SmartActionsIntegrationProps> = ({
  onAction,
  context,
  recommendation
}) => {
  const handleQuickAction = (actionType: string) => {
    onAction?.(actionType);
  };

  const quickActions = [
    {
      id: 'analyze-conversation',
      label: 'Analyze Chat',
      icon: BarChart3,
      description: 'Get insights from this conversation',
      variant: 'default' as const
    },
    {
      id: 'extract-actions',
      label: 'Extract Actions',
      icon: Target,
      description: 'Find actionable items from chat',
      variant: 'secondary' as const
    },
    {
      id: 'generate-summary',
      label: 'Summarize',
      icon: MessageSquare,
      description: 'Create conversation summary',
      variant: 'outline' as const
    },
    {
      id: 'optimize-workflow',
      label: 'Smart Optimize',
      icon: Zap,
      description: 'AI-powered workflow optimization',
      variant: 'default' as const,
      highlight: true
    }
  ];

  return (
    <div className="space-y-4">
      {/* AI Recommendation Banner */}
      {recommendation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Smart Recommendation</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {recommendation.reasoning}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(recommendation.confidence)}% confidence
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleQuickAction(`smart:${recommendation.action}`)}
                    className="h-7 text-xs"
                  >
                    Apply <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Smart Action Bar */}
      {context && (
        <div className="mb-4">
          <SmartActionBar
            context={context}
            recommendation={recommendation}
          />
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant={action.variant}
              size="sm"
              onClick={() => handleQuickAction(action.id)}
              className={`
                w-full h-auto p-3 flex flex-col items-start gap-2 text-left
                ${action.highlight ? 'ring-2 ring-primary/50' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                <action.icon className="h-4 w-4" />
                <span className="font-medium text-xs">{action.label}</span>
              </div>
              <p className="text-xs opacity-80 line-clamp-2">
                {action.description}
              </p>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Context Info */}
      {context && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Smart Actions Available</span>
            <Badge variant="outline" className="text-xs">
              {context.approvalStatus || 'Active'}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};