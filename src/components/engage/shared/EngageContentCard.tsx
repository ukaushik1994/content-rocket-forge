import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface EngageContentCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  statusBadge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
    pulse?: boolean;
  };
  index?: number;
  selected?: boolean;
}

export const EngageContentCard: React.FC<EngageContentCardProps> = ({
  children,
  onClick,
  className = '',
  statusBadge,
  index = 0,
  selected = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div
        onClick={onClick}
        className={`
          relative group glass-card glass-card-hover p-4
          hover:border-primary/30
          ${onClick ? 'cursor-pointer' : ''}
          ${selected ? 'ring-1 ring-primary/50 border-primary/30 bg-primary/5' : ''}
          ${className}
        `}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Status badge */}
        {statusBadge && (
          <div className="absolute top-3 right-3 z-10">
            <Badge
              variant={statusBadge.variant || 'outline'}
              className={`text-[10px] gap-1 ${statusBadge.className || ''}`}
            >
              {statusBadge.pulse && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                </span>
              )}
              {statusBadge.label}
            </Badge>
          </div>
        )}

        <div className="relative z-[1]">{children}</div>
      </div>
    </motion.div>
  );
};
