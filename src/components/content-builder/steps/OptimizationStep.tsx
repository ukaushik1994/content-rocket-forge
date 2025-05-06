
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { OptimizationLayout } from '@/components/content-builder/optimization/OptimizationLayout';

// Custom error fallback component for the optimization step
const OptimizationErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-6 rounded-lg border border-red-200 bg-red-50 text-red-800">
    <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
    <p className="mb-4">{error.message || "An unexpected error occurred in the optimization step"}</p>
    <div className="flex gap-3">
      <button 
        onClick={resetErrorBoundary} 
        className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

export const OptimizationStep = () => {
  const { state, skipOptimizationStep } = useContentBuilder();
  const { optimizationSkipped } = state;
  
  // Handle recovery from error states
  const handleResetError = () => {
    // Force reload the component
    window.location.reload();
  };
  
  return (
    <ErrorBoundary 
      FallbackComponent={OptimizationErrorFallback} 
      onReset={handleResetError}
      resetKeys={[optimizationSkipped]}
    >
      <OptimizationLayout />
    </ErrorBoundary>
  );
};
