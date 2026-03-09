import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UnifiedEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  className?: string;
  loading?: boolean;
}

export const UnifiedEmptyState: React.FC<UnifiedEmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  className,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className={cn('glass-card p-12 flex flex-col items-center justify-center text-center', className)}>
        <div className="w-12 h-12 rounded-2xl bg-muted/50 animate-pulse mb-4" />
        <div className="h-6 w-48 bg-muted/50 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted/50 rounded animate-pulse mb-6" />
        <div className="h-10 w-40 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn('glass-card p-12 flex flex-col items-center justify-center text-center', className)}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
      >
        <Icon className="w-6 h-6 text-primary" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-title text-foreground mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-[15px] text-muted-foreground max-w-md mb-6"
      >
        {description}
      </motion.p>

      {(actionLabel || secondaryLabel) && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-3"
        >
          {actionLabel && onAction && (
            <Button onClick={onAction} size="sm">
              {actionLabel}
            </Button>
          )}
          {secondaryLabel && onSecondary && (
            <Button onClick={onSecondary} variant="ghost" size="sm" className="text-muted-foreground">
              {secondaryLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
