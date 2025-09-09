import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Brain, Settings, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import AIServiceController, { ProviderInfo } from '@/services/aiService/AIServiceController';

interface SimpleConfigureDialogProps {
  provider: ProviderInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const SimpleConfigureDialog: React.FC<SimpleConfigureDialogProps> = ({
  provider,
  isOpen,
  onClose,
  onSave
}) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('API key is required');
      return;
    }
    
    onSave(apiKey.trim());
    setApiKey('');
    onClose();
  };

  if (!provider) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Setup {provider.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href={provider.setup_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {provider.name} dashboard
                <ExternalLink className="h-3 w-3 ml-1 inline" />
              </a>
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function SimpleProviderManagement() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [configureProvider, setConfigureProvider] = useState<ProviderInfo | null>(null);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const allProviders = await AIServiceController.getAllProviders();
      setProviders(allProviders);
    } catch (error) {
      console.error('Failed to load providers:', error);
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSave = async (apiKey: string) => {
    if (!configureProvider) return;

    try {
      const configuredProviders = providers.filter(p => p.is_configured);
      const priority = configuredProviders.length + 1;

      await AIServiceController.addProvider({
        provider: configureProvider.id,
        api_key: apiKey,
        priority
      });

      toast.success(`${configureProvider.name} configured successfully`);
      await loadProviders();
    } catch (error) {
      console.error('Failed to configure provider:', error);
      toast.error('Failed to configure provider');
    }
  };


  useEffect(() => {
    loadProviders();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Providers
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {providers.map((provider) => (
            <div 
              key={provider.id} 
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Brain className="h-4 w-4" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{provider.name}</span>
                    {provider.is_configured ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="outline">Setup Required</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfigureProvider(provider)}
              >
                {provider.is_configured ? 'Reconfigure' : 'Setup'}
              </Button>
            </div>
          ))}

          {providers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No AI providers available</p>
            </div>
          )}
        </div>

        <SimpleConfigureDialog
          provider={configureProvider}
          isOpen={!!configureProvider}
          onClose={() => setConfigureProvider(null)}
          onSave={handleProviderSave}
        />
      </CardContent>
    </Card>
  );
}