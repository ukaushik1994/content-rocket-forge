import React from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChartErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ChartErrorFallback: React.FC<ChartErrorFallbackProps> = ({
  error,
  resetErrorBoundary
}) => {
  console.error('Chart rendering error:', error);
  
  return (
    <Alert className="border-destructive/20 bg-destructive/5">
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <AlertDescription className="space-y-3">
        <div>
          <p className="font-medium text-destructive">Chart Visualization Error</p>
          <p className="text-sm text-muted-foreground mt-1">
            Unable to render the chart visualization. This may be due to incompatible data format.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetErrorBoundary}
            className="border-destructive/30 hover:bg-destructive/10"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Retry
          </Button>
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        </div>
      </AlertDescription>
    </Alert>
  );
};

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export const ChartErrorBoundary: React.FC<ChartErrorBoundaryProps> = ({
  children,
  onReset
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={ChartErrorFallback}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
};