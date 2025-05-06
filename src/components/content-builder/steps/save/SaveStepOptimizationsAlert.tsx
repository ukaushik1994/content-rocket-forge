
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export const SaveStepOptimizationsAlert: React.FC = () => {
  const { state } = useContentBuilder();
  
  // Count how many optimizations have been applied
  const appliedOptimizationsCount = state.seoImprovements?.filter(improvement => improvement.applied).length || 0;
  const totalOptimizationsCount = state.seoImprovements?.length || 0;
  
  return (
    <div className="flex items-center gap-2 p-4 rounded-md bg-green-50 border border-green-200 text-green-700">
      <CheckCircle className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium">Content has been optimized</p>
        <p className="text-sm">
          {appliedOptimizationsCount} out of {totalOptimizationsCount} SEO improvements have been applied.
        </p>
      </div>
    </div>
  );
};
