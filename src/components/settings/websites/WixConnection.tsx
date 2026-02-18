import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getConnection, saveWixConnection, testConnection, deleteConnection } from '@/services/websiteConnection';

interface WixConnectionProps {
  onConnectionChange: () => void;
}

export const WixConnection = ({ onConnectionChange }: WixConnectionProps) => {
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [siteId, setSiteId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    const connection = await getConnection('wix');
    setConnectionInfo(connection);
    if (connection) {
      setSiteId(connection.site_id || '');
    }
  };

  const handleSave = async () => {
    if (!siteId.trim() || !apiKey.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both Site ID and API Key',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    const success = await saveWixConnection({
      siteId: siteId.trim(),
      apiKey: apiKey.trim()
    });
    setIsSaving(false);

    if (success) {
      toast({
        title: 'Connection Saved',
        description: 'Wix connection has been saved successfully'
      });
      await loadConnection();
      onConnectionChange();
      setApiKey(''); // Clear sensitive data
    } else {
      toast({
        title: 'Save Failed',
        description: 'Failed to save Wix connection',
        variant: 'destructive'
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
        : 'Failed to connect to Wix. Please check your credentials.',
      variant: success ? 'default' : 'destructive'
    });
  };

  const handleDisconnect = async () => {
    const success = await deleteConnection('wix');
    if (success) {
      setConnectionInfo(null);
      setSiteId('');
      setApiKey('');
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
        <Card className="p-4 bg-transparent border-border/20">
          <h4 className="font-medium mb-2 text-sm">🔐 Wix API Connection</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Connect your Wix site using your Site ID and API Key.
          </p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside mt-2">
            <li>Go to your Wix Dashboard</li>
            <li>Navigate to Settings → API Keys</li>
            <li>Create a new API key with blog permissions</li>
            <li>Copy your Site ID and API Key below</li>
          </ol>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            When creating your API key, make sure to enable <strong>Blog (Manage Blog)</strong> permissions.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <Label htmlFor="wix-site-id">Site ID</Label>
            <Input
              id="wix-site-id"
              placeholder="e.g., abc123def"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="wix-api-key">API Key</Label>
            <Input
              id="wix-api-key"
              type="password"
              placeholder="Your Wix API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} className="w-full" disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Connect Wix Site
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-transparent border border-green-500/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900 dark:text-green-100">Connected</span>
          </div>
          
          {connectionInfo.site_id && (
            <div className="text-sm">
              <span className="text-muted-foreground">Site ID:</span>
              <span className="ml-2 font-medium">{connectionInfo.site_id}</span>
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
