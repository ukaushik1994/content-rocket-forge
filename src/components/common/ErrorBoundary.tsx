
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-red-700 dark:text-red-300">
              {this.props.fallbackTitle || 'Something went wrong'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {this.props.onRetry && (
              <Button
                variant="outline"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onRetry?.();
                }}
                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
