import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, ArrowUp, ArrowDown, Settings2, TestTube, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AIServiceController from '@/services/aiService/AIServiceController';
import { toast } from 'sonner';

interface Provider {
  id: string;
  provider: string;
  api_key: string;
  status: 'active' | 'error' | 'inactive';
  priority: number;
  preferred_model?: string;
  error_message?: string;
  last_verified?: string;
}

const PROVIDER_INFO = {
  openrouter: { name: 'OpenRouter', description: 'Access to multiple AI models through one API' },
  anthropic: { name: 'Anthropic', description: 'Claude models for reasoning and analysis' },
  gemini: { name: 'Google Gemini', description: 'Googles advanced AI models' },
  mistral: { name: 'Mistral AI', description: 'Open and efficient AI models' },
  openai: { name: 'OpenAI', description: 'GPT models for text generation' },
  lmstudio: { name: 'LM Studio', description: 'Local AI models via LM Studio' }
};

export function ProviderManagement() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [bulkEnabled, setBulkEnabled] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const activeProviders = await AIServiceController.getInstance().getActiveProviders();
      setProviders(activeProviders);
    } catch (error) {
      console.error('Failed to load providers:', error);
      toast.error('Failed to load AI providers');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = async (providerId: string, direction: 'up' | 'down') => {
    const currentIndex = providers.findIndex(p => p.id === providerId);
    if (currentIndex === -1) return;

    const newProviders = [...providers];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newProviders.length) return;

    // Swap priorities
    const temp = newProviders[currentIndex].priority;
    newProviders[currentIndex].priority = newProviders[targetIndex].priority;
    newProviders[targetIndex].priority = temp;

    // Swap positions
    [newProviders[currentIndex], newProviders[targetIndex]] = 
    [newProviders[targetIndex], newProviders[currentIndex]];

    setProviders(newProviders);

    try {
      // Update in database
      await Promise.all([
        AIServiceController.getInstance().updateProvider(newProviders[targetIndex].id, {
          priority: newProviders[targetIndex].priority
        }),
        AIServiceController.getInstance().updateProvider(newProviders[currentIndex].id, {
          priority: newProviders[currentIndex].priority
        })
      ]);
      toast.success('Provider priority updated');
    } catch (error) {
      console.error('Failed to update priority:', error);
      toast.error('Failed to update provider priority');
      loadProviders(); // Reload on error
    }
  };

  const handleTestProvider = async (provider: Provider) => {
    setTestingProvider(provider.id);
    try {
      const success = await AIServiceController.getInstance().testProvider(provider.provider, provider.api_key);
      if (success) {
        toast.success(`${PROVIDER_INFO[provider.provider]?.name} test successful`);
        // Update provider status
        setProviders(prev => prev.map(p => 
          p.id === provider.id 
            ? { ...p, status: 'active', error_message: undefined, last_verified: new Date().toISOString() }
            : p
        ));
      } else {
        toast.error(`${PROVIDER_INFO[provider.provider]?.name} test failed`);
      }
    } catch (error) {
      console.error('Provider test failed:', error);
      toast.error(`${PROVIDER_INFO[provider.provider]?.name} test failed: ${error.message}`);
      // Update provider status with error
      setProviders(prev => prev.map(p => 
        p.id === provider.id 
          ? { ...p, status: 'error', error_message: error.message }
          : p
      ));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    try {
      await AIServiceController.getInstance().deleteProvider(providerId);
      setProviders(prev => prev.filter(p => p.id !== providerId));
      toast.success('Provider deleted');
    } catch (error) {
      console.error('Failed to delete provider:', error);
      toast.error('Failed to delete provider');
    }
  };

  const handleTestAllProviders = async () => {
    if (providers.length === 0) return;
    
    setTestingAll(true);
    try {
      const results = await Promise.allSettled(
        providers.map(provider => 
          AIServiceController.getInstance().testProvider(provider.provider, provider.api_key)
            .then(success => ({ id: provider.id, success, provider: provider.provider }))
        )
      );

      let successCount = 0;
      const updatedProviders = [...providers];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { id, success, provider: providerName } = result.value;
          const providerIndex = updatedProviders.findIndex(p => p.id === id);
          if (providerIndex !== -1) {
            if (success) {
              successCount++;
              updatedProviders[providerIndex] = {
                ...updatedProviders[providerIndex],
                status: 'active',
                error_message: undefined,
                last_verified: new Date().toISOString()
              };
            } else {
              updatedProviders[providerIndex] = {
                ...updatedProviders[providerIndex],
                status: 'error',
                error_message: 'Test failed'
              };
            }
          }
        }
      });

      setProviders(updatedProviders);
      toast.success(`Tested ${providers.length} providers. ${successCount} working.`);
    } catch (error) {
      console.error('Bulk test failed:', error);
      toast.error('Failed to test providers');
    } finally {
      setTestingAll(false);
    }
  };

  const handleToggleAllProviders = async (enabled: boolean) => {
    try {
      const updates = providers.map(provider => 
        AIServiceController.getInstance().updateProvider(provider.id, { status: enabled ? 'active' : 'inactive' })
      );
      await Promise.all(updates);
      
      setProviders(prev => prev.map(p => ({ ...p, status: enabled ? 'active' : 'inactive' })));
      setBulkEnabled(enabled);
      toast.success(`All providers ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle providers:', error);
      toast.error('Failed to update providers');
    }
  };

  const getStatusBadge = (provider: Provider) => {
    switch (provider.status) {
      case 'active':
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading providers...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            AI Provider Management
          </CardTitle>
          <div className="flex items-center gap-2">
            {providers.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleTestAllProviders}
                  disabled={testingAll}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testingAll ? 'Testing All...' : 'Test All'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleToggleAllProviders(!bulkEnabled)}
                >
                  {bulkEnabled ? 'Disable All' : 'Enable All'}
                </Button>
              </>
            )}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
               </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add AI Provider</DialogTitle>
                  <DialogDescription>
                    Configure a new AI provider with API key and priority.
                  </DialogDescription>
                </DialogHeader>
                <AddProviderForm onSuccess={() => {
                  setIsAddModalOpen(false);
                  loadProviders();
                }} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>No AI providers configured</p>
            <p className="text-sm">Add a provider to get started</p>
          </div>
        ) : (
          providers.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePriorityChange(provider.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                          {provider.priority}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePriorityChange(provider.id, 'down')}
                          disabled={index === providers.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold">
                          {PROVIDER_INFO[provider.provider]?.name || provider.provider}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {PROVIDER_INFO[provider.provider]?.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(provider)}
                          {provider.preferred_model && (
                            <Badge variant="outline">{provider.preferred_model}</Badge>
                          )}
                          {provider.last_verified && (
                            <span className="text-xs text-muted-foreground">
                              Last verified: {new Date(provider.last_verified).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {provider.error_message && (
                          <p className="text-xs text-destructive mt-1">{provider.error_message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestProvider(provider)}
                        disabled={testingProvider === provider.id}
                      >
                        <TestTube className="h-3 w-3 mr-1" />
                        {testingProvider === provider.id ? 'Testing...' : 'Test'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProvider(provider.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function AddProviderForm({ onSuccess }: { onSuccess: () => void }) {
  const [provider, setProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !apiKey) return;

    setIsSubmitting(true);
    try {
      await AIServiceController.getInstance().addProvider({
        provider,
        api_key: apiKey,
        preferred_model: model || undefined,
        priority: 999 // Will be adjusted automatically
      });
      toast.success('Provider added successfully');
      onSuccess();
    } catch (error) {
      console.error('Failed to add provider:', error);
      toast.error('Failed to add provider');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="provider">Provider</Label>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROVIDER_INFO).map(([key, info]) => (
              <SelectItem key={key} value={key}>
                {info.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter API key"
          required
        />
      </div>

      <div>
        <Label htmlFor="model">Preferred Model (optional)</Label>
        <Input
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="e.g., gpt-4o-mini, claude-3-haiku"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Adding...' : 'Add Provider'}
      </Button>
    </form>
  );
}