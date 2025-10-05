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
  openrouter: {
    name: 'OpenRouter',
    description: 'Access to multiple AI models through one API'
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Claude models for reasoning and analysis'
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Googles advanced AI models'
  },
  mistral: {
    name: 'Mistral AI',
    description: 'Open and efficient AI models'
  },
  openai: {
    name: 'OpenAI',
    description: 'GPT models for text generation'
  },
  lmstudio: {
    name: 'LM Studio',
    description: 'Local AI models via LM Studio'
  }
};
export function ProviderManagement() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [bulkEnabled, setBulkEnabled] = useState(true);
  const [activatingAll, setActivatingAll] = useState(false);
  useEffect(() => {
    loadProviders();
  }, []);
  const loadProviders = async () => {
    try {
      const activeProviders = await AIServiceController.getActiveProviders();
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
    [newProviders[currentIndex], newProviders[targetIndex]] = [newProviders[targetIndex], newProviders[currentIndex]];
    setProviders(newProviders);
    try {
      // Update in database
      await Promise.all([AIServiceController.updateProvider(newProviders[targetIndex].id, {
        priority: newProviders[targetIndex].priority
      }), AIServiceController.updateProvider(newProviders[currentIndex].id, {
        priority: newProviders[currentIndex].priority
      })]);
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
      const success = await AIServiceController.testProvider(provider.provider, provider.api_key);
      if (success) {
        toast.success(`${PROVIDER_INFO[provider.provider]?.name} test successful`);
        // Update provider status
        setProviders(prev => prev.map(p => p.id === provider.id ? {
          ...p,
          status: 'active',
          error_message: undefined,
          last_verified: new Date().toISOString()
        } : p));
      } else {
        toast.error(`${PROVIDER_INFO[provider.provider]?.name} test failed`);
      }
    } catch (error) {
      console.error('Provider test failed:', error);
      toast.error(`${PROVIDER_INFO[provider.provider]?.name} test failed: ${error.message}`);
      // Update provider status with error
      setProviders(prev => prev.map(p => p.id === provider.id ? {
        ...p,
        status: 'error',
        error_message: error.message
      } : p));
    } finally {
      setTestingProvider(null);
    }
  };
  const handleDeleteProvider = async (providerId: string) => {
    try {
      await AIServiceController.deleteProvider(providerId);
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
      const results = await Promise.allSettled(providers.map(provider => AIServiceController.testProvider(provider.provider, provider.api_key).then(success => ({
        id: provider.id,
        success,
        provider: provider.provider
      }))));
      let successCount = 0;
      const updatedProviders = [...providers];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const {
            id,
            success,
            provider: providerName
          } = result.value;
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
  const handleActivateAllWithKeys = async () => {
    setActivatingAll(true);
    try {
      const updates = providers
        .filter(p => p.api_key && p.api_key.trim())
        .map(provider => AIServiceController.updateProvider(provider.id, {
          status: 'active'
        }));
      
      await Promise.all(updates);
      await loadProviders();
      toast.success('All providers with API keys activated');
    } catch (error) {
      console.error('Failed to activate providers:', error);
      toast.error('Failed to activate providers');
    } finally {
      setActivatingAll(false);
    }
  };

  const handleToggleAllProviders = async (enabled: boolean) => {
    try {
      const updates = providers.map(provider => AIServiceController.updateProvider(provider.id, {
        status: enabled ? 'active' : 'inactive'
      }));
      await Promise.all(updates);
      setProviders(prev => prev.map(p => ({
        ...p,
        status: enabled ? 'active' : 'inactive'
      })));
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
  return;
}
function AddProviderForm({
  onSuccess
}: {
  onSuccess: () => void;
}) {
  const [provider, setProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !apiKey) return;
    setIsSubmitting(true);
    try {
      await AIServiceController.addProvider({
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
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="provider">Provider</Label>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROVIDER_INFO).map(([key, info]) => <SelectItem key={key} value={key}>
                {info.name}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="apiKey">API Key</Label>
        <Input id="apiKey" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter API key" required />
      </div>

      <div>
        <Label htmlFor="model">Preferred Model (optional)</Label>
        <Input id="model" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g., gpt-4o-mini, claude-3-haiku" />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Adding...' : 'Add Provider'}
      </Button>
    </form>;
}