import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bug, RefreshCw } from 'lucide-react';
import { forceSyncApiKeys, debugApiKeyStatus } from '@/services/aiService/manualSync';

interface SyncDebugButtonProps {
  className?: string;
}

export function SyncDebugButton({ className = '' }: SyncDebugButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleForceSync = async () => {
    setIsLoading(true);
    try {
      await forceSyncApiKeys();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebug = async () => {
    await debugApiKeyStatus();
  };

  return (
    <div className={`flex flex-col gap-3 p-4 bg-card border border-border rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        <Bug className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">AI Sync Debug Tools</h3>
        <Badge variant="outline" className="text-xs">Debug</Badge>
      </div>
      
      <p className="text-xs text-muted-foreground">
        If AI services aren't working, use these tools to diagnose and fix sync issues between API keys and providers.
      </p>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleForceSync}
          disabled={isLoading}
          className="flex-1"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Force Sync
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDebug}
          className="flex-1"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Debug Status
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground border-t pt-2">
        <strong>Force Sync:</strong> Manually sync API keys to AI providers table<br />
        <strong>Debug Status:</strong> Check console for detailed sync information
      </div>
    </div>
  );
}