import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Wifi, WifiOff, RefreshCw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getProviderStatuses, clearRateLimitState, ApiProvider } from '@/services/apiErrorResilience';
import { cn } from '@/lib/utils';

interface GlobalApiStatusProps {
  className?: string;
  variant?: 'compact' | 'full';
}

interface ProviderStatus {
  provider: ApiProvider;
  isLimited: boolean;
  cooldownSeconds: number;
}

export function GlobalApiStatus({ className, variant = 'compact' }: GlobalApiStatusProps) {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStatus = () => {
      setProviders(getProviderStatuses());
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const limitedProviders = providers.filter(p => p.isLimited);
  const hasIssues = !isOnline || limitedProviders.length > 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const handleClearAll = () => {
    limitedProviders.forEach(({ provider }) => clearRateLimitState(provider));
  };

  if (!hasIssues) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}
      >
        <CheckCircle2 className="w-3 h-3 text-success" />
        <span>All systems operational</span>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("flex items-center gap-2", className)}
      >
        {!isOnline && (
          <Badge variant="destructive" className="gap-1 text-xs">
            <WifiOff className="w-3 h-3" />
            Offline
          </Badge>
        )}
        {limitedProviders.length > 0 && (
          <Badge variant="secondary" className="gap-1 text-xs bg-warning/20 text-warning border-warning/30">
            <AlertTriangle className="w-3 h-3" />
            {limitedProviders.length} API{limitedProviders.length > 1 ? 's' : ''} limited
          </Badge>
        )}
      </motion.div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-lg border p-3",
          !isOnline ? "border-destructive/50 bg-destructive/5" : "border-warning/50 bg-warning/5",
          className
        )}
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              {!isOnline ? (
                <WifiOff className="w-4 h-4 text-destructive" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {!isOnline ? 'No Internet Connection' : 'API Rate Limits Active'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {!isOnline 
                    ? 'Check your connection and try again'
                    : `${limitedProviders.length} provider${limitedProviders.length > 1 ? 's' : ''} rate limited`
                  }
                </p>
              </div>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-border/50 space-y-2"
              >
                {limitedProviders.map(({ provider, cooldownSeconds }) => (
                  <div key={provider} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{provider}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatTime(cooldownSeconds)} remaining
                    </Badge>
                  </div>
                ))}
                
                {limitedProviders.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="w-full mt-2 gap-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Clear All & Retry
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </motion.div>
    </Collapsible>
  );
}
