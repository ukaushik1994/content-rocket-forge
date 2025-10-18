import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getConnection, testConnection, deleteConnection } from '@/services/websiteConnection';

interface WixConnectionProps {
  onConnectionChange: () => void;
}

export const WixConnection = ({ onConnectionChange }: WixConnectionProps) => {
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    const connection = await getConnection('wix');
    setConnectionInfo(connection);
  };

  const handleConnect = async () => {
    const { initiateWixOAuth } = await import('@/services/websiteConnection/wixOAuthService');
    
    toast({
      title: 'Opening Wix Authorization',
      description: 'Please authorize access in the popup window',
    });

    const result = await initiateWixOAuth();

    if (result.success) {
      toast({
        title: 'Connected Successfully',
        description: 'Your Wix site has been connected',
      });
      await loadConnection();
      onConnectionChange();
    } else {
      toast({
        title: 'Connection Failed',
        description: result.error || 'Failed to connect to Wix',
        variant: 'destructive',
      });
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    const success = await testConnection('wix');
    setIsTesting(false);

    toast({
      title: success ? 'Connection Successful' : 'Connection Failed',
      description: success 
        ? 'Wix connection verified successfully'
        : 'Failed to connect to Wix. Please reconnect.',
      variant: success ? 'default' : 'destructive'
    });
  };

  const handleDisconnect = async () => {
    const success = await deleteConnection('wix');
    if (success) {
      setConnectionInfo(null);
      toast({
        title: 'Disconnected',
        description: 'Wix connection has been removed'
      });
      onConnectionChange();
    }
  };

  if (!connectionInfo || !connectionInfo.is_active) {
    return (
      <div className="space-y-4">
        {/* Helper Card */}
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-2 text-sm">🔐 Wix OAuth Connection</h4>
          <p className="text-xs text-muted-foreground mb-2">
            We'll securely connect to your Wix site using OAuth.
          </p>
          <p className="text-xs text-muted-foreground">
            When you click "Connect Wix Site":
          </p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside mt-2">
            <li>A popup will open asking you to log in to Wix</li>
            <li>Select the site you want to connect</li>
            <li>Authorize blog publishing permissions</li>
            <li>You'll be redirected back automatically</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-2">
            We'll store a secure token - no passwords required!
          </p>
        </Card>

        <Button onClick={handleConnect} className="w-full">
          <ExternalLink className="h-4 w-4 mr-2" />
          Connect Wix Site
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900 dark:text-green-100">Connected</span>
          </div>
          
          {connectionInfo.site_name && (
            <div className="text-sm">
              <span className="text-muted-foreground">Site:</span>
              <span className="ml-2 font-medium">{connectionInfo.site_name}</span>
            </div>
          )}
          
          {connectionInfo.site_email && (
            <div className="text-sm">
              <span className="text-muted-foreground">Account:</span>
              <span className="ml-2 font-medium">{connectionInfo.site_email}</span>
            </div>
          )}
          
          {connectionInfo.scopes && connectionInfo.scopes.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Scopes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {connectionInfo.scopes.map((scope: string) => (
                  <Badge key={scope} variant="outline" className="text-xs">
                    {scope}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {connectionInfo.last_tested_at && (
            <div className="text-xs text-muted-foreground">
              Last tested: {new Date(connectionInfo.last_tested_at).toLocaleString()}
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={isTesting}
        >
          {isTesting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Test Connection
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDisconnect}
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
};