
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200/20 bg-red-900/5 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100/10 mb-4">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error || 'Failed to load solutions. Please try again.'}
      </p>
      <Button onClick={onRetry} variant="outline" className="border-red-300/20 bg-red-900/10 hover:bg-red-900/20">
        Try Again
      </Button>
    </div>
  );
};
