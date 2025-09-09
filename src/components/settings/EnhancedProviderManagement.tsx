import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  MessageSquare, 
  Binary, 
  Server, 
  Search, 
  Plus,
  Settings,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Trash2,
  ArrowUp,
  ArrowDown,
  TestTube
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import AIServiceController, { ProviderInfo } from '@/services/aiService/AIServiceController';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  brain: Brain,
  'message-square': MessageSquare,
  binary: Binary,
  server: Server,
  search: Search
};

interface ProviderCardProps {
  provider: ProviderInfo;
  onConfigure: () => void;
  onTest: () => void;
  onToggle: () => void;
  onDelete?: () => void;
  onPriorityChange?: (direction: 'up' | 'down') => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onConfigure,
  onTest,
  onToggle,
  onDelete,
  onPriorityChange,
  canMoveUp,
  canMoveDown
}) => {
  const IconComponent = ICON_MAP[provider.icon_name] || Brain;
  
  const getStatusColor = () => {
    switch (provider.status) {
      case 'active': return 'border-green-500/40 bg-green-500/5';
      case 'error': return 'border-red-500/40 bg-red-500/5';
      default: return 'border-border/50 bg-background/50';
    }
  };

  const getStatusIcon = () => {
    switch (provider.status) {
      case 'active': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`transition-all duration-300 ${getStatusColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background/50 border border-border/30">
                <IconComponent className="h-5 w-5 text-foreground/80" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{provider.name}</h4>
                  {provider.is_required && (
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      Required
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {provider.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Switch 
                checked={provider.is_configured} 
                onCheckedChange={onToggle}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {provider.category}
              </Badge>
              {provider.capabilities.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {provider.capabilities.slice(0, 2).join(', ')}
                  {provider.capabilities.length > 2 && ` +${provider.capabilities.length - 2}`}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {provider.is_configured && onPriorityChange && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPriorityChange('up')}
                    disabled={!canMoveUp}
                    className="h-7 w-7 p-0"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPriorityChange('down')}
                    disabled={!canMoveDown}
                    className="h-7 w-7 p-0"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </>
              )}
              
              {provider.is_configured && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onTest}
                  className="h-7 w-7 p-0"
                >
                  <TestTube className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={onConfigure}
                className="h-7 text-xs px-2"
              >
                {provider.is_configured ? 'Configure' : 'Setup'}
                <Settings className="h-3 w-3 ml-1" />
              </Button>
              
              {provider.is_configured && onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDelete}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface ConfigureProviderDialogProps {
  provider: ProviderInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { apiKey: string; model?: string }) => void;
}

const ConfigureProviderDialog: React.FC<ConfigureProviderDialogProps> = ({
  provider,
  isOpen,
  onClose,
  onSave
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('API key is required');
      return;
    }
    
    onSave({ apiKey: apiKey.trim(), model: selectedModel || undefined });
    setApiKey('');
    setSelectedModel('');
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

          {provider.available_models.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="model">Preferred Model (Optional)</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {provider.available_models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const EnhancedProviderManagement: React.FC = () => {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [configureProvider, setConfigureProvider] = useState<ProviderInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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

  const handleProviderSave = async (providerData: { apiKey: string; model?: string }) => {
    if (!configureProvider) return;

    try {
      const configuredProviders = providers.filter(p => p.is_configured);
      const priority = configuredProviders.length + 1;

      await AIServiceController.addProvider({
        provider: configureProvider.id,
        api_key: providerData.apiKey,
        preferred_model: providerData.model,
        priority
      });

      toast.success(`${configureProvider.name} configured successfully`);
      await loadProviders();
    } catch (error) {
      console.error('Failed to configure provider:', error);
      toast.error('Failed to configure provider');
    }
  };

  const handleProviderTest = async (provider: ProviderInfo) => {
    try {
      const success = await AIServiceController.testProvider(provider.id);
      if (success) {
        toast.success(`${provider.name} is working correctly`);
      } else {
        toast.error(`${provider.name} test failed`);
      }
    } catch (error) {
      toast.error(`Failed to test ${provider.name}`);
    }
  };

  const handleProviderToggle = async (provider: ProviderInfo) => {
    if (provider.is_configured) {
      // Remove provider
      try {
        // This would need to be implemented in AIServiceController
        toast.info('Provider removal not yet implemented');
      } catch (error) {
        toast.error('Failed to remove provider');
      }
    } else {
      // Configure provider
      setConfigureProvider(provider);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const categories = ['all', ...Array.from(new Set(providers.map(p => p.category)))];
  
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || provider.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const configuredProviders = filteredProviders.filter(p => p.is_configured);
  const availableProviders = filteredProviders.filter(p => !p.is_configured);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button onClick={loadProviders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category === 'all' ? 'All' : category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-6">
            {/* Configured Providers */}
            {configuredProviders.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configured Providers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {configuredProviders.map((provider, index) => (
                      <ProviderCard
                        key={provider.id}
                        provider={provider}
                        onConfigure={() => setConfigureProvider(provider)}
                        onTest={() => handleProviderTest(provider)}
                        onToggle={() => handleProviderToggle(provider)}
                        canMoveUp={index > 0}
                        canMoveDown={index < configuredProviders.length - 1}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Available Providers */}
            {availableProviders.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Available Providers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {availableProviders.map((provider) => (
                      <ProviderCard
                        key={provider.id}
                        provider={provider}
                        onConfigure={() => setConfigureProvider(provider)}
                        onTest={() => handleProviderTest(provider)}
                        onToggle={() => handleProviderToggle(provider)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {filteredProviders.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium">No providers found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or category filters
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Configure Provider Dialog */}
      <ConfigureProviderDialog
        provider={configureProvider}
        isOpen={!!configureProvider}
        onClose={() => setConfigureProvider(null)}
        onSave={handleProviderSave}
      />
    </div>
  );
};