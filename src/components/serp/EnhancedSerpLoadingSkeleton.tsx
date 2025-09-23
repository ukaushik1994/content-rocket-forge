import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface EnhancedSerpLoadingSkeletonProps {
  variant?: 'analysis' | 'workflow' | 'export' | 'minimal';
  showProgress?: boolean;
  progressValue?: number;
}

export const EnhancedSerpLoadingSkeleton: React.FC<EnhancedSerpLoadingSkeletonProps> = ({
  variant = 'analysis',
  showProgress = false,
  progressValue = 0
}) => {
  const skeletonVariants = {
    pulse: {
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="space-y-4">
        <motion.div variants={skeletonVariants} animate="pulse">
          <Skeleton className="h-8 w-3/4 mb-4" />
        </motion.div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <motion.div key={i} variants={skeletonVariants} animate="pulse">
              <Skeleton className="h-16 w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'workflow') {
    return (
      <Card>
        <CardHeader>
          <motion.div variants={skeletonVariants} animate="pulse">
            <Skeleton className="h-6 w-48" />
          </motion.div>
          {showProgress && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <motion.div variants={skeletonVariants} animate="pulse">
                  <Skeleton className="h-4 w-24" />
                </motion.div>
                <motion.div variants={skeletonVariants} animate="pulse">
                  <Skeleton className="h-4 w-16" />
                </motion.div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressValue}%` }}
                  animate={{ width: `${progressValue}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
              <motion.div variants={skeletonVariants} animate="pulse">
                <Skeleton className="h-8 w-8 rounded-full" />
              </motion.div>
              <div className="flex-1 space-y-2">
                <motion.div variants={skeletonVariants} animate="pulse">
                  <Skeleton className="h-4 w-32" />
                </motion.div>
                <motion.div variants={skeletonVariants} animate="pulse">
                  <Skeleton className="h-3 w-48" />
                </motion.div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'export') {
    return (
      <div className="space-y-4">
        <motion.div variants={skeletonVariants} animate="pulse">
          <Skeleton className="h-6 w-40 mb-4" />
        </motion.div>
        <div className="grid grid-cols-3 gap-3">
          {['PDF', 'CSV', 'Share'].map((label, i) => (
            <motion.div key={i} variants={skeletonVariants} animate="pulse">
              <Card className="p-4 text-center">
                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Default 'analysis' variant
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <motion.div variants={skeletonVariants} animate="pulse">
          <Skeleton className="h-8 w-64" />
        </motion.div>
        <motion.div variants={skeletonVariants} animate="pulse">
          <Skeleton className="h-4 w-96" />
        </motion.div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div key={i} variants={skeletonVariants} animate="pulse">
            <Card className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Competitors Section */}
          <Card>
            <CardHeader>
              <motion.div variants={skeletonVariants} animate="pulse">
                <Skeleton className="h-6 w-32" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <motion.div variants={skeletonVariants} animate="pulse">
                    <Skeleton className="h-8 w-8" />
                  </motion.div>
                  <div className="flex-1 space-y-2">
                    <motion.div variants={skeletonVariants} animate="pulse">
                      <Skeleton className="h-4 w-48" />
                    </motion.div>
                    <motion.div variants={skeletonVariants} animate="pulse">
                      <Skeleton className="h-3 w-32" />
                    </motion.div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Keywords Section */}
          <Card>
            <CardHeader>
              <motion.div variants={skeletonVariants} animate="pulse">
                <Skeleton className="h-6 w-40" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <motion.div variants={skeletonVariants} animate="pulse">
                    <Skeleton className="h-4 w-32" />
                  </motion.div>
                  <motion.div variants={skeletonVariants} animate="pulse">
                    <Skeleton className="h-4 w-16" />
                  </motion.div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Chart Section */}
          <Card>
            <CardHeader>
              <motion.div variants={skeletonVariants} animate="pulse">
                <Skeleton className="h-6 w-36" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div variants={skeletonVariants} animate="pulse">
                <Skeleton className="h-64 w-full" />
              </motion.div>
            </CardContent>
          </Card>

          {/* Opportunities Section */}
          <Card>
            <CardHeader>
              <motion.div variants={skeletonVariants} animate="pulse">
                <Skeleton className="h-6 w-28" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <motion.div variants={skeletonVariants} animate="pulse">
                    <Skeleton className="h-4 w-40 mb-2" />
                  </motion.div>
                  <motion.div variants={skeletonVariants} animate="pulse">
                    <Skeleton className="h-3 w-full" />
                  </motion.div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};