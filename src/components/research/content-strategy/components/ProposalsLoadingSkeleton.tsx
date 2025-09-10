import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export const ProposalsLoadingSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <Skeleton className="h-4 w-32 bg-white/5" />
        </div>
        <Skeleton className="h-10 w-32 bg-white/10" />
      </div>

      {/* Proposals grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-panel border-white/10 shadow-xl">
              <CardHeader>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4 bg-white/10" />
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-4 w-2/3 bg-white/5" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Keywords skeleton */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
                  <Skeleton className="h-6 w-24 bg-white/10 rounded-full" />
                  <Skeleton className="h-6 w-16 bg-white/10 rounded-full" />
                </div>

                {/* Metrics skeleton */}
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-12 bg-white/5" />
                    <Skeleton className="h-5 w-16 bg-white/10" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 bg-white/5" />
                    <Skeleton className="h-5 w-12 bg-white/10" />
                  </div>
                </div>

                {/* Action buttons skeleton */}
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-9 flex-1 bg-white/10" />
                  <Skeleton className="h-9 w-24 bg-white/10" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};