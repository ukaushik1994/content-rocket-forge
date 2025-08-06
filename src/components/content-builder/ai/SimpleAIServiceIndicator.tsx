import React from 'react';
import { useAIServiceStatus } from '@/hooks/useAIServiceStatus';
import { Sparkles } from 'lucide-react';

interface SimpleAIServiceIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function SimpleAIServiceIndicator({ 
  size = 'md', 
  showLabel = true,
  className = ''
}: SimpleAIServiceIndicatorProps) {
  const { isEnabled, hasProviders, activeProviders, isLoading } = useAIServiceStatus();
  
  const isActive = isEnabled && hasProviders && activeProviders > 0;
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-sm px-4 py-2';
      default: return 'text-xs px-3 py-1.5';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-4 w-4';
      default: return 'h-3 w-3';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 bg-muted/30 rounded-full border border-border/30 ${getSizeClasses()} ${className}`}>
        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" />
        {showLabel && <span className="text-muted-foreground">AI Service</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 rounded-full border backdrop-blur-sm ${getSizeClasses()} ${className} ${
      isActive 
        ? 'bg-primary/10 text-primary border-primary/20' 
        : 'bg-muted/30 text-muted-foreground border-border/30'
    }`}>
      <div className={`rounded-full ${
        isActive ? 'bg-green-400' : 'bg-red-400'
      } ${size === 'sm' ? 'w-2 h-2' : 'w-2 h-2'} ${isActive ? 'animate-pulse' : ''}`} />
      {showLabel && (
        <>
          <Sparkles className={`${getIconSize()} ${isActive ? 'animate-pulse' : ''}`} />
          <span>AI Service</span>
        </>
      )}
    </div>
  );
}