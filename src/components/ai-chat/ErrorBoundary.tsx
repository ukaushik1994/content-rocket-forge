import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, MessageSquare, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class EnhancedChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Enhanced Chat Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external error service if needed
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Here you could send to an error reporting service
    console.group('🚨 Enhanced Chat Error Details');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Boundary State:', this.state);
    console.groupEnd();
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private getErrorMessage = (error?: Error): string => {
    if (!error) return 'An unexpected error occurred';
    
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('chunk') || errorMsg.includes('loading')) {
      return 'Failed to load chat components. This might be due to a network issue.';
    }
    if (errorMsg.includes('render') || errorMsg.includes('component')) {
      return 'Chat component rendering error. Some features may not display correctly.';
    }
    if (errorMsg.includes('memory') || errorMsg.includes('recursion')) {
      return 'Memory or performance issue detected. Try refreshing the page.';
    }
    
    return `Chat error: ${error.message}`;
  };

  private getRecoveryActions = (error?: Error) => {
    const actions = [
      {
        id: 'retry',
        label: 'Try Again',
        icon: RefreshCw,
        onClick: this.handleRetry,
        variant: 'default' as const,
        disabled: this.state.retryCount >= 3
      }
    ];

    if (error?.message.includes('network') || error?.message.includes('chunk')) {
      actions.push({
        id: 'refresh',
        label: 'Refresh Page',
        icon: RefreshCw,
        onClick: this.handleRefresh,
        variant: 'default' as const,
        disabled: false
      });
    }

    actions.push({
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => window.history.pushState({}, '', '/settings'),
      variant: 'default' as const,
      disabled: false
    });

    return actions;
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const actions = this.getRecoveryActions(this.state.error);

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center min-h-[400px] p-4"
        >
          <Card className="max-w-md w-full p-6 text-center space-y-6 border-destructive/20 bg-destructive/5">
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center"
            >
              <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </motion.div>

            {/* Error Message */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Chat Error Detected
              </h3>
              <p className="text-sm text-muted-foreground">
                {this.getErrorMessage(this.state.error)}
              </p>
              {this.state.retryCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Retry attempts: {this.state.retryCount}/3
                </p>
              )}
            </div>

            {/* Recovery Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-2"
            >
              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Button
                    variant={action.variant}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className="w-full"
                    size="sm"
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                </motion.div>
              ))}
            </motion.div>

            {/* Error Details (in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Show Error Details
                </summary>
                <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </Card>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <EnhancedChatErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedChatErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};