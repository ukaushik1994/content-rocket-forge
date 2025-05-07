
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {error}
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onRetry}
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
