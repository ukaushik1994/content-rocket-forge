
import React from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export const SaveStepOptimizationsAlert: React.FC = () => {
  const { state } = useContentBuilder();
  const { seoOptimizationMetrics, seoImprovements } = state;
  
  // If we don't have metrics, show basic message
  if (!seoOptimizationMetrics) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-md bg-green-50 border border-green-200 text-green-700">
        <CheckCircle className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">Content has been optimized</p>
          <p className="text-sm">SEO improvements from the optimization step have been applied.</p>
        </div>
      </div>
    );
  }
  
  // Calculate applied improvements
  const appliedImprovements = seoImprovements?.filter(imp => imp.applied)?.length || 0;
  const totalImprovements = seoImprovements?.length || 0;
  
  // Calculate score improvement
  const scoreDifference = seoOptimizationMetrics.currentScore - seoOptimizationMetrics.originalScore;
  
  return (
    <div className="flex items-center gap-2 p-4 rounded-md bg-green-50 border border-green-200 text-green-700">
      <CheckCircle className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium">Content has been optimized</p>
        <p className="text-sm">
          {scoreDifference > 0 ? (
            <>
              Your SEO score improved by <span className="font-medium">+{scoreDifference}%</span> with {appliedImprovements} of {totalImprovements} optimizations applied.
            </>
          ) : (
            <>
              {appliedImprovements} of {totalImprovements} SEO optimizations have been applied.
            </>
          )}
        </p>
      </div>
      {scoreDifference > 0 && (
        <div className="flex items-center gap-1 text-green-600 font-medium">
          <TrendingUp className="h-4 w-4" />
          +{scoreDifference}%
        </div>
      )}
    </div>
  );
};
