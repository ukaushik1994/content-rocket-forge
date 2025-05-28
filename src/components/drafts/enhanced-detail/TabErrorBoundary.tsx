
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface TabErrorBoundaryProps {
  children: React.ReactNode;
  tabName: string;
  onRetry?: () => void;
}

interface TabErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class TabErrorBoundary extends React.Component<TabErrorBoundaryProps, TabErrorBoundaryState> {
  constructor(props: TabErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TabErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.tabName} tab:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="h-full flex items-center justify-center">
          <CardContent className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <div>
              <CardTitle className="text-lg mb-2">Error in {this.props.tabName}</CardTitle>
              <p className="text-sm text-muted-foreground mb-4">
                Something went wrong while loading this tab. Please try again.
              </p>
              {this.state.error && (
                <details className="text-xs text-muted-foreground mb-4">
                  <summary className="cursor-pointer">Error details</summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-left overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <Button onClick={this.handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
