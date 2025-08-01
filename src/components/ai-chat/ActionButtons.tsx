
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContextualAction } from '@/services/aiService';
import { ArrowRight, Zap, TrendingUp, FileText, Settings } from 'lucide-react';

interface ActionButtonsProps {
  actions: ContextualAction[];
  onAction: (action: string, data?: any) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ actions, onAction }) => {
  const getActionIcon = (actionId: string) => {
    if (actionId.includes('keyword')) return TrendingUp;
    if (actionId.includes('content')) return FileText;
    if (actionId.includes('optimize')) return Zap;
    if (actionId.includes('settings')) return Settings;
    return ArrowRight;
  };

  const getActionColor = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0';
      case 'secondary':
        return 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-0';
      default:
        return 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30';
    }
  };

  return (
    <div className="space-y-2">
      {actions.map((action, index) => {
        const IconComponent = getActionIcon(action.id);
        
        if (action.type === 'card') {
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card 
                className="p-4 cursor-pointer hover:bg-white/10 transition-colors bg-white/5 border-white/10"
                onClick={() => onAction(action.action, action.data)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">{action.label}</h4>
                    {action.description && (
                      <p className="text-xs text-white/60 mt-1">{action.description}</p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/40" />
                </div>
              </Card>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="inline-block"
          >
            <Button
              size="sm"
              className={`mr-2 mb-2 ${getActionColor(action.variant)}`}
              onClick={() => onAction(action.action, action.data)}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
};
