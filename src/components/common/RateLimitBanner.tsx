import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getProviderStatuses, clearRateLimitState, ApiProvider } from '@/services/apiErrorResilience';

interface RateLimitBannerProps {
  onRetry?: () => void;
  className?: string;
}

export function RateLimitBanner({ onRetry, className }: RateLimitBannerProps) {
  const [limitedProviders, setLimitedProviders] = useState<Array<{
    provider: ApiProvider;
    cooldownSeconds: number;
  }>>([]);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const checkStatus = () => {
      const statuses = getProviderStatuses();
      const limited = statuses.filter(s => s.isLimited);
      setLimitedProviders(limited);
      
      if (limited.length > 0) {
        setCountdown(Math.max(...limited.map(l => l.cooldownSeconds)));
      } else {
        setCountdown(0);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  if (limitedProviders.length === 0) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleClearLimits = () => {
    limitedProviders.forEach(({ provider }) => {
      clearRateLimitState(provider);
    });
    setLimitedProviders([]);
    onRetry?.();
  };

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        API Rate Limit Active
        <span className="flex items-center gap-1 text-sm font-normal">
          <Clock className="h-3 w-3" />
          {formatTime(countdown)}
        </span>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>
          {limitedProviders.map(l => l.provider.toUpperCase()).join(', ')} 
          {limitedProviders.length === 1 ? ' has' : ' have'} reached rate limits.
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearLimits}
            className="h-7"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Clear & Retry Now
          </Button>
          <span className="text-xs text-muted-foreground">
            Or wait for automatic reset
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
}
