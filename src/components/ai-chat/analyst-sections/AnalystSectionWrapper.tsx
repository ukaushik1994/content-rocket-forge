import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnalystSectionWrapperProps {
  number: string;
  label: string;
  headline: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const AnalystSectionWrapper: React.FC<AnalystSectionWrapperProps> = ({
  number,
  label,
  headline,
  children,
  delay = 0,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className={cn('relative', className)}
    >
      {/* Section number + label */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/50">
          {number}. {label}
        </span>
      </div>

      {/* Dynamic headline */}
      <h3 className="text-lg font-bold text-foreground leading-tight mb-3">
        {headline}
      </h3>

      {/* Section content */}
      <div className="space-y-3">{children}</div>
    </motion.div>
  );
};
