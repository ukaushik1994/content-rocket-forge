import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'chart' | 'message' | 'list';
  lines?: number;
  className?: string;
}

const shimmerVariants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: { 
    backgroundPosition: '200% 0',
    transition: { 
      duration: 2.5, 
      repeat: Infinity, 
      ease: 'linear' 
    } 
  }
};

const BaseSkeleton = ({ className }: { className?: string }) => (
  <motion.div
    variants={shimmerVariants}
    initial="initial"
    animate="animate"
    className={cn(
      "rounded-md",
      "bg-gradient-to-r from-muted via-muted/60 to-muted",
      "bg-[length:200%_100%]",
      className
    )}
  />
);

export function SkeletonLoader({ variant = 'text', lines = 3, className }: SkeletonLoaderProps) {
  if (variant === 'text') {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <BaseSkeleton
            key={i}
            className={cn(
              "h-4",
              i === lines - 1 ? "w-3/4" : "w-full"
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn("p-4 rounded-lg border border-border/50 space-y-3", className)}>
        <div className="flex items-center gap-3">
          <BaseSkeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <BaseSkeleton className="h-4 w-1/3" />
            <BaseSkeleton className="h-3 w-1/2" />
          </div>
        </div>
        <BaseSkeleton className="h-4 w-full" />
        <BaseSkeleton className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <BaseSkeleton className="h-8 w-20 rounded-md" />
          <BaseSkeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    const barHeights = [60, 80, 45, 90, 55, 75, 65]; // Fixed heights for deterministic render
    return (
      <div className={cn("p-4 rounded-lg border border-border/50 space-y-4", className)}>
        <div className="flex justify-between items-center">
          <BaseSkeleton className="h-5 w-32" />
          <BaseSkeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="flex items-end gap-2 h-40">
          {barHeights.map((height, i) => (
            <BaseSkeleton
              key={i}
              className={cn("flex-1", `h-[${height}%]`)}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <BaseSkeleton key={i} className="h-3 w-8" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'message') {
    return (
      <div className={cn("flex gap-3", className)}>
        <BaseSkeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <BaseSkeleton className="h-4 w-24" />
          <div className="space-y-2 p-3 rounded-lg bg-muted/30">
            <BaseSkeleton className="h-4 w-full" />
            <BaseSkeleton className="h-4 w-4/5" />
            <BaseSkeleton className="h-4 w-3/5" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
            <BaseSkeleton className="w-10 h-10 rounded-md" />
            <div className="flex-1 space-y-2">
              <BaseSkeleton className="h-4 w-1/2" />
              <BaseSkeleton className="h-3 w-1/3" />
            </div>
            <BaseSkeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
