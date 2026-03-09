import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface EngageSkeletonCardsProps {
  count?: number;
  layout?: 'grid' | 'list';
}

export const EngageSkeletonCards: React.FC<EngageSkeletonCardsProps> = ({
  count = 6,
  layout = 'list',
}) => {
  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(count)].map((_, i) => (
          <Card key={i} className="p-5 bg-background/60 backdrop-blur-xl border-border/50">
            <Skeleton className="h-5 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
};
