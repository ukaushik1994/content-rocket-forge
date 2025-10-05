import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Server, ExternalLink, Info } from 'lucide-react';
import { toast } from 'sonner';
import LMStudioService from '@/services/lmStudioService';

export function LMStudioSettings() {
  const [serverUrl, setServerUrl] = useState('http://localhost:1234');
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const url = await LMStudioService.getServerUrl();
      setServerUrl(url);
      
      // Try to connect and get models
      const connected = await LMStudioService.testConnection(url);
      setConnectionStatus(connected ? 'connected' : 'disconnected');
      
      if (connected) {
        const models = await LMStudioService.getAvailableModels(url);
        setAvailableModels(models);
        if (models.length > 0 && !selectedModel) {
          setSelectedModel(models[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading LM Studio settings:', error);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      const connected = await LMStudioService.testConnection(serverUrl);
      setConnectionStatus(connected ? 'connected' : 'disconnected');
      
      if (connected) {
        toast.success('LM Studio connected successfully!');
        const models = await LMStudioService.getAvailableModels(serverUrl);
        setAvailableModels(models);
        if (models.length > 0 && !selectedModel) {
          setSelectedModel(models[0].id);
        }
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await LMStudioService.saveServerUrl(serverUrl);
      if (success) {
        await handleTestConnection();
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            LM Studio Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Connection Status</span>
            </div>
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
              {connectionStatus === 'connected' && (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </>
              )}
              {connectionStatus === 'disconnected' && (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
              {connectionStatus === 'unknown' && (
                <>
                  <Info className="h-3 w-3 mr-1" />
                  Unknown
                </>
              )}
            </Badge>
          </div>

          {/* Server URL */}
          <div className="space-y-2">
            <Label htmlFor="server-url">Server URL</Label>
            <Input
              id="server-url"
              type="text"
              placeholder="http://localhost:1234"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The URL where LM Studio's local server is running
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={isTesting}
              variant="outline"
            >
              {isTesting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Test Connection
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !serverUrl.trim()}
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Settings
            </Button>
          </div>

          {/* Available Models */}
          {availableModels.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <Label>Available Models ({availableModels.length})</Label>
              <div className="space-y-2">
                {availableModels.map((model) => (
                  <div
                    key={model.id}
                    className="p-2 rounded-lg bg-muted/50 text-sm"
                  >
                    <div className="font-medium">{model.id}</div>
                    <div className="text-xs text-muted-foreground">
                      Owner: {model.owned_by}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              LM Studio runs locally on your computer, keeping your data private and secure.
              No data is sent to external servers.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                1
              </div>
              <div className="space-y-1">
                <p className="font-medium">Download LM Studio</p>
                <p className="text-sm text-muted-foreground">
                  Download and install LM Studio from their official website
                </p>
                <Button variant="link" className="h-auto p-0 text-xs" asChild>
                  <a href="https://lmstudio.ai" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    lmstudio.ai
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Load a Model</p>
                <p className="text-sm text-muted-foreground">
                  Open LM Studio and download/load a model (e.g., Llama, Mistral, Phi)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Enable CORS</p>
                <p className="text-sm text-muted-foreground">
                  In LM Studio: Settings → Server → Enable CORS
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-medium">Start Local Server</p>
                <p className="text-sm text-muted-foreground">
                  Click "Start Server" in LM Studio (default port: 1234)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                5
              </div>
              <div>
                <p className="font-medium">Test Connection</p>
                <p className="text-sm text-muted-foreground">
                  Enter the server URL above and click "Test Connection"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
