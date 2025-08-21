import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingStateWrapperProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  loadingMessage?: string;
  children: React.ReactNode;
}

export function LoadingStateWrapper({ 
  isLoading, 
  error, 
  onRetry, 
  loadingMessage = "Loading...",
  children 
}: LoadingStateWrapperProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-center">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}