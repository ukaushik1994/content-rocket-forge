import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Brain, 
  MessageSquare, 
  Binary, 
  Server, 
  Search,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import AIServiceController, { ProviderInfo } from '@/services/aiService/AIServiceController';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  brain: Brain,
  'message-square': MessageSquare,
  binary: Binary,
  server: Server,
  search: Search
};

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
          <DialogTitle className="flex items-center gap-2">
            {React.createElement(ICON_MAP[provider.icon_name] || Brain, { className: "h-5 w-5" })}
            Configure {provider.name}
          </DialogTitle>
          <DialogDescription>
            {provider.description}
          </DialogDescription>
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
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                {provider.name} dashboard
                <ExternalLink className="h-3 w-3" />
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
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

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

  const handleTestProvider = async (provider: ProviderInfo) => {
    if (!provider.is_configured) {
      toast.error('Provider must be configured before testing');
      return;
    }

    setTestingProvider(provider.id);
    try {
      const success = await AIServiceController.testProvider(provider.id, '');
      if (success) {
        toast.success(`${provider.name} is working correctly`);
      } else {
        toast.error(`${provider.name} test failed`);
      }
    } catch (error) {
      toast.error(`Failed to test ${provider.name}`);
    } finally {
      setTestingProvider(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
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
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const configuredProviders = providers.filter(p => p.is_configured);
  const availableProviders = providers.filter(p => !p.is_configured);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Providers
        </CardTitle>
        <Button onClick={loadProviders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configured Providers */}
        {configuredProviders.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Configured Providers</h3>
            <div className="space-y-2">
              {configuredProviders.map((provider) => {
                const IconComponent = ICON_MAP[provider.icon_name] || Brain;
                const isTestingThis = testingProvider === provider.id;
                
                return (
                  <div 
                    key={provider.id} 
                    className="flex items-center justify-between p-3 border rounded-lg bg-green-50/50 border-green-200/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <IconComponent className="h-4 w-4 text-green-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{provider.name}</span>
                          <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-200">
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(provider.status)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTestProvider(provider)}
                        disabled={isTestingThis}
                      >
                        {isTestingThis ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfigureProvider(provider)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Providers */}
        {availableProviders.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Available Providers</h3>
            <div className="space-y-2">
              {availableProviders.map((provider) => {
                const IconComponent = ICON_MAP[provider.icon_name] || Brain;
                
                return (
                  <div 
                    key={provider.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{provider.name}</span>
                          <Badge variant="outline" className="text-xs">Not configured</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {provider.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfigureProvider(provider)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Setup
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {providers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No AI providers available</p>
          </div>
        )}

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