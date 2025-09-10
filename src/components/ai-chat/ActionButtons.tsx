
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { ContextualAction } from '@/services/aiService';

interface ActionButtonsProps {
  actions: ContextualAction[];
  onAction: (action: string, data?: any) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ actions, onAction }) => {
  if (!actions || actions.length === 0) return null;

  const handleActionClick = (action: ContextualAction) => {
    console.log('Action clicked:', action);
    if (action?.action) {
      onAction(action.action, action.data);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Suggested Actions</h3>
      <div className="grid gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {action.type === 'card' ? (
              <Card 
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => handleActionClick(action)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white flex items-center justify-between">
                    {action.label}
                    <ArrowRight className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {action.description && (
                    <p className="text-xs text-white/70">{action.description}</p>
                  )}
                  {action.data && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(action.data).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {String(value)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Button
                variant={action.variant === 'primary' ? 'default' : action.variant === 'outline' ? 'outline' : 'outline'}
                className="w-full justify-between text-left"
                onClick={() => handleActionClick(action)}
              >
                <span className="flex flex-col items-start">
                  <span>{action.label}</span>
                  {action.description && (
                    <span className="text-xs opacity-70">{action.description}</span>
                  )}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
