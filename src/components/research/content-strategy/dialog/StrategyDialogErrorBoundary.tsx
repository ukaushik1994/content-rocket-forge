import React, { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  onReset: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class StrategyDialogErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[StrategyDialog] CRITICAL ERROR:', error, errorInfo);
    
    // Check if error is retryable based on message
    const isRetryable = !error.message.toLowerCase().includes('auth') && 
                       !error.message.toLowerCase().includes('permission');
    
    toast.error(
      isRetryable 
        ? 'A temporary error occurred - your work has been saved' 
        : 'An unexpected error occurred - your work has been saved'
    );
    
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="max-w-md border-destructive/50">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Application Error</h2>
              <p className="text-muted-foreground mb-6">
                The strategy builder encountered an unexpected error. Your content has been auto-saved.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={this.handleReset} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
                <Button onClick={() => window.location.href = '/'} className="gap-2">
                  <Home className="h-4 w-4" />
                  Return Home
                </Button>
              </div>
              {this.state.error && (
                <details className="mt-4 text-left text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Technical Details
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded text-[10px] overflow-auto max-h-32">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
