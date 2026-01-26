import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, RefreshCw, ChevronDown, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ErrorSeverity = 'warning' | 'error' | 'info';

interface ErrorBannerProps {
  severity?: ErrorSeverity;
  title: string;
  message: string;
  details?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  dismissable?: boolean;
  helpUrl?: string;
  className?: string;
}

const severityConfig = {
  warning: {
    variant: 'default' as const,
    borderColor: 'border-warning/50',
    bgColor: 'bg-warning/5',
    iconColor: 'text-warning',
  },
  error: {
    variant: 'destructive' as const,
    borderColor: 'border-destructive/50',
    bgColor: 'bg-destructive/5',
    iconColor: 'text-destructive',
  },
  info: {
    variant: 'default' as const,
    borderColor: 'border-primary/50',
    bgColor: 'bg-primary/5',
    iconColor: 'text-primary',
  },
};

export function ErrorBanner({
  severity = 'error',
  title,
  message,
  details,
  actionLabel,
  onAction,
  onDismiss,
  dismissable = true,
  helpUrl,
  className,
}: ErrorBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const config = severityConfig[severity];

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 200);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Alert
            variant={config.variant}
            className={cn(
              config.borderColor,
              config.bgColor,
              "relative",
              className
            )}
          >
            <AlertTriangle className={cn("h-4 w-4", config.iconColor)} />
            
            <div className="flex-1 pr-8">
              <AlertTitle className="flex items-center gap-2">
                {title}
                {details && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </button>
                )}
              </AlertTitle>
              
              <AlertDescription className="mt-1">
                <p>{message}</p>
                
                <AnimatePresence>
                  {isExpanded && details && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 pt-2 border-t border-border/50"
                    >
                      <pre className="text-xs whitespace-pre-wrap break-words text-muted-foreground font-mono">
                        {details}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-2 mt-3">
                  {actionLabel && onAction && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAction}
                      className="h-7 gap-1.5"
                    >
                      <RefreshCw className="h-3 w-3" />
                      {actionLabel}
                    </Button>
                  )}
                  
                  {helpUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-7 gap-1.5 text-muted-foreground"
                    >
                      <a href={helpUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        Learn more
                      </a>
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </div>

            {dismissable && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
