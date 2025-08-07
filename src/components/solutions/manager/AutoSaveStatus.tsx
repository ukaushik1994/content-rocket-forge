import React from 'react';
import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AutoSaveStatusProps {
  isAutoSaving: boolean;
  lastAutoSave: Date | null;
  hasError: boolean;
  className?: string;
}

export const AutoSaveStatus: React.FC<AutoSaveStatusProps> = ({
  isAutoSaving,
  lastAutoSave,
  hasError,
  className
}) => {
  const getStatus = () => {
    if (isAutoSaving) {
      return {
        icon: Loader2,
        text: 'Saving...',
        variant: 'secondary' as const,
        className: 'animate-spin'
      };
    }
    
    if (hasError) {
      return {
        icon: AlertCircle,
        text: 'Save failed',
        variant: 'destructive' as const,
        className: ''
      };
    }
    
    if (lastAutoSave) {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastAutoSave.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return {
          icon: Check,
          text: 'Saved just now',
          variant: 'default' as const,
          className: ''
        };
      } else if (diffInSeconds < 300) {
        return {
          icon: Check,
          text: `Saved ${Math.floor(diffInSeconds / 60)}m ago`,
          variant: 'secondary' as const,
          className: ''
        };
      }
    }
    
    return {
      icon: Clock,
      text: 'Auto-save enabled',
      variant: 'outline' as const,
      className: ''
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <Badge 
      variant={status.variant} 
      className={cn('flex items-center gap-1.5 text-xs', className)}
    >
      <Icon className={cn('h-3 w-3', status.className)} />
      {status.text}
    </Badge>
  );
};