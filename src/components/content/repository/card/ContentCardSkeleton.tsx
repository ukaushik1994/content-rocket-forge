
import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ContentCardSkeleton: React.FC = () => {
  return (
    <Card className="p-4 animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      
      <Skeleton className="h-6 w-3/4 mb-2" />
      
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      
      <div className="flex flex-wrap gap-1.5 mb-3">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className="h-4 w-18 rounded-full" />
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-1">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
      </div>
    </Card>
  );
};
