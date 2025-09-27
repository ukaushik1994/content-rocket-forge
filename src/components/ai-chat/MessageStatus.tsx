import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: Date;
  className?: string;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({
  status,
  timestamp,
  className
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      case 'failed':
        return 'Failed';
      default:
        return 'Sending';
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity",
      className
    )}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {timestamp && (
        <span className="text-muted-foreground ml-1">
          {timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      )}
    </div>
  );
};