
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circular' | 'rectangular';
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  lines = 1
}) => {
  const baseClasses = 'bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse';
  
  const variants = {
    text: 'h-4 rounded',
    card: 'h-32 rounded-lg',
    circular: 'rounded-full aspect-square',
    rectangular: 'h-8 rounded-md'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <motion.div
            key={i}
            className={`${baseClasses} ${variants.text}`}
            style={{ width: i === lines - 1 ? '75%' : '100%' }}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
};

export const ContentPreviewSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-3">
      <LoadingSkeleton variant="text" className="w-3/4" />
      <LoadingSkeleton variant="text" lines={4} />
    </div>
    <div className="space-y-2">
      <LoadingSkeleton variant="text" className="w-1/2" />
      <LoadingSkeleton variant="text" lines={3} />
    </div>
    <LoadingSkeleton variant="rectangular" className="h-24" />
  </div>
);

export const MetricsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 gap-3">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="p-3 border rounded-lg space-y-2">
        <LoadingSkeleton variant="text" className="w-16 h-6" />
        <LoadingSkeleton variant="text" className="w-12 h-4" />
      </div>
    ))}
  </div>
);
