import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChatAction } from '@/hooks/useAIChat';
import { 
  ArrowRight, 
  ExternalLink, 
  Play, 
  Plus, 
  Search,
  FileText,
  BarChart3,
  Zap,
  Grid3X3,
  MessageSquare
} from 'lucide-react';

interface ActionButtonsProps {
  actions: ChatAction[];
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
    if (action.includes('repurpos')) return Zap;
    if (action.includes('quick-actions')) return Grid3X3;
    if (action.includes('navigate')) return ArrowRight;
    if (action.includes('serp')) return BarChart3;
    return Plus;
  };

  const getVariant = (variant?: string) => {
    switch (variant) {
      case 'primary': return 'default';
      case 'secondary': return 'secondary';
      case 'outline': return 'outline';
      default: return 'outline';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap gap-2"
    >
      {actions.map((action) => {
        const Icon = getIcon(action.action);
        const isExternal = action.action.startsWith('navigate:');
        
        return (
          <motion.div
            key={action.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={getVariant(action.variant)}
              size="sm"
              onClick={() => onAction(action.action, action.data)}
              className="
                h-8 px-3 text-xs font-medium gap-1.5 
                bg-gradient-to-r from-background/80 to-background/60 
                border-white/20 hover:border-primary/40 
                hover:from-primary/10 hover:to-primary/5
                transition-all duration-200
                backdrop-blur-sm
              "
            >
              <Icon className="h-3 w-3" />
              {action.label}
              {isExternal && <ExternalLink className="h-2.5 w-2.5" />}
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
};