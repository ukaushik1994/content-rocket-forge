import React, { Component, ReactNode } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  tileName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class TileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[TileErrorBoundary] ${this.props.tileName || 'Tile'} crashed:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <GlassCard className="p-5 border-destructive/20">
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm font-medium mb-1">Failed to load {this.props.tileName || 'this section'}</p>
            <p className="text-xs text-muted-foreground mb-3">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button size="sm" variant="outline" onClick={this.handleReset}>
              Retry
            </Button>
          </div>
        </GlassCard>
      );
    }

    return this.props.children;
  }
}
