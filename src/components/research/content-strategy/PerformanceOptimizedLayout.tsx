import React, { Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import { SmartLoadingState } from './SmartLoadingState';
import { Lightbulb, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PerformanceOptimizedLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  loadingSteps?: string[];
  className?: string;
}

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center p-8 glass-card border border-red-500/20 rounded-xl"
  >
    <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
    <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
    <p className="text-white/60 text-center mb-4 max-w-md">
      {error.message || 'An unexpected error occurred while loading the content strategy interface.'}
    </p>
    <Button
      onClick={resetErrorBoundary}
      variant="outline"
      className="glass-panel border-white/20 text-white hover:bg-white/10"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Try Again
    </Button>
  </motion.div>
);

// Optimized Loading Fallback
const LoadingFallback = ({ steps }: { steps?: string[] }) => (
  <SmartLoadingState
    title="Loading Content Strategy"
    subtitle="Preparing your workspace..."
    icon={Lightbulb}
    steps={steps || [
      'Initializing AI engine...',
      'Loading strategy data...',
      'Preparing analytics...',
      'Optimizing interface...'
    ]}
    progress={0}
  />
);

// Memoized Layout Container
const LayoutContainer = React.memo(({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`space-y-6 ${className || ''}`}>
    {children}
  </div>
));

LayoutContainer.displayName = 'LayoutContainer';

export const PerformanceOptimizedLayout: React.FC<PerformanceOptimizedLayoutProps> = ({
  children,
  loading = false,
  error = null,
  onRetry,
  loadingSteps,
  className
}) => {
  // Memoize the error boundary reset function
  const resetError = useMemo(() => {
    return () => {
      if (onRetry) {
        onRetry();
      }
    };
  }, [onRetry]);

  // Early return for loading state
  if (loading) {
    return <LoadingFallback steps={loadingSteps} />;
  }

  // Early return for error state
  if (error) {
    return <ErrorFallback error={error} resetErrorBoundary={resetError} />;
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={resetError}
      resetKeys={[children]} // Reset when children change
    >
      <Suspense fallback={<LoadingFallback steps={loadingSteps} />}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <LayoutContainer className={className}>
            {children}
          </LayoutContainer>
        </motion.div>
      </Suspense>
    </ErrorBoundary>
  );
};