import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export const CalendarLoadingSkeleton: React.FC = () => {
  return (
    <Card className="glass-panel border-white/10 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
            <Skeleton className="h-8 w-48 bg-white/10" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 bg-white/10" />
            <Skeleton className="h-6 w-32 bg-white/5" />
            <Skeleton className="h-8 w-8 bg-white/10" />
            <Skeleton className="h-8 w-24 bg-white/10" />
            <Skeleton className="h-8 w-28 bg-white/10" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Days of week skeleton */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Skeleton key={day} className="h-8 bg-white/5" />
          ))}
        </div>
        
        {/* Calendar grid skeleton */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className="min-h-[120px] p-2 rounded-lg border border-white/10 bg-white/5"
            >
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-6 bg-white/10" />
                <Skeleton className="h-4 w-4 bg-white/5" />
              </div>
              
              <div className="space-y-1">
                {Math.random() > 0.7 && (
                  <>
                    <Skeleton className="h-8 bg-white/10 rounded" />
                    {Math.random() > 0.5 && (
                      <Skeleton className="h-8 bg-white/5 rounded" />
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};