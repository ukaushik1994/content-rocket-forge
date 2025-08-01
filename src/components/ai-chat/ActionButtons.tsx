
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  FileText, 
  Search, 
  BarChart3, 
  Target, 
  ExternalLink 
} from 'lucide-react';
import { ContextualAction } from '@/services/aiService';

interface ActionButtonsProps {
  actions: ContextualAction[];
  onAction: (action: string, data?: any) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  onAction
}) => {
  const getIcon = (action: string) => {
    if (action.includes('keyword')) return Search;
    if (action.includes('content-builder')) return FileText;
    if (action.includes('analytics')) return BarChart3;
    if (action.includes('strategy')) return Target;
    return ArrowRight;
  };

  const getVariant = (variant?: string) => {
    switch (variant) {
      case 'primary': return 'default';
      case 'secondary': return 'secondary';
      case 'outline': return 'outline';
      default: return 'outline';
    }
  };

  if (actions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap gap-2 mt-4"
    >
      {actions.map((action) => {
        const Icon = getIcon(action.action);
        const isExternal = action.action.startsWith('navigate:');
        
        return (
          <motion.div
            key={action.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={getVariant(action.variant)}
              size="sm"
              onClick={() => onAction(action.action, action.data)}
              className="gap-2 text-xs"
            >
              <Icon className="h-3 w-3" />
              {action.label}
              {isExternal && <ExternalLink className="h-3 w-3" />}
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
