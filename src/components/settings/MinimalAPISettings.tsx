import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, CheckCircle, XCircle, MessageCircle, Search } from 'lucide-react';
import { getAllApiKeysStatus } from '@/services/apiKeys/crud';
import { getUserPreference } from '@/services/userPreferencesService';
import { ApiKeyInput } from './api/ApiKeyInput';
import { ApiProvider } from '@/services/apiKeyService';
import { AiProvider } from '@/services/aiService/types';
import { toast } from 'sonner';
import { AIChatTestModal } from './modals/AIChatTestModal';
import { SERPTestModal } from './modals/SERPTestModal';

interface StatusDotProps {
  isConnected: boolean;
}

function StatusDot({ isConnected }: StatusDotProps) {
  return (
    <div className={`flex items-center gap-1 text-xs ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
      {isConnected ? 'Connected' : 'Not configured'}
    </div>
  );
}

interface ProviderCardProps {
  name: string;
  icon: string;
  isConfigured: boolean;
  provider: ApiProvider;
  category: 'ai' | 'serp';
  onClick: () => void;
  onTest?: () => void;
}

function ProviderCard({ name, icon, isConfigured, provider, category, onClick, onTest }: ProviderCardProps) {
  return (
    <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <div className="font-medium">{name}</div>
            <StatusDot isConnected={isConfigured} />
          </div>
        </div>
        <Settings className="h-4 w-4 text-muted-foreground" />
      </div>
      
      {isConfigured && onTest && (
        <div className="mt-3 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onTest();
            }}
            className="w-full"
          >
            {category === 'ai' ? (
              <>
                <MessageCircle className="h-4 w-4 mr-2" />
                Test Chat
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Test Search
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ApiProvider | null;
}

function ConfigurationModal({ isOpen, onClose, provider }: ConfigurationModalProps) {
  if (!provider) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure {provider}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ApiKeyInput provider={provider as any} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MinimalAPISettings() {
  const [configuredProviders, setConfiguredProviders] = useState<Record<string, boolean>>({});
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultProvider, setDefaultProvider] = useState<string>('');
  const [testChatProvider, setTestChatProvider] = useState<AiProvider | null>(null);
  const [testSerpProvider, setTestSerpProvider] = useState<'serp' | 'serpstack' | null>(null);

  const aiProviders = [
    { id: 'openrouter', name: 'OpenRouter', icon: '🔄' },
    { id: 'openai', name: 'OpenAI', icon: '🤖' },
    { id: 'anthropic', name: 'Anthropic', icon: '🎭' },
    { id: 'gemini', name: 'Google Gemini', icon: '💎' },
    { id: 'mistral', name: 'Mistral', icon: '🌪️' },
    { id: 'lmstudio', name: 'LM Studio', icon: '🎬' },
  ];

  const serpProviders = [
    { id: 'serp', name: 'SERP API', icon: '🔍' },
    { id: 'serpstack', name: 'Serpstack', icon: '📊' },
  ];

  const loadProviderStatus = async () => {
    try {
      const status = await getAllApiKeysStatus();
      setConfiguredProviders(status);
    } catch (error) {
      console.error('Failed to load provider status:', error);
    }
  };

  useEffect(() => {
    loadProviderStatus();
    
    // Load default AI provider
    const loadDefaultProvider = () => {
      try {
        const defaultAiProvider = getUserPreference('defaultAiProvider');
        setDefaultProvider(defaultAiProvider || '');
      } catch (error) {
        console.error('Failed to load default provider:', error);
      }
    };
    
    loadDefaultProvider();
  }, []);

  const handleProviderConfigure = (provider: ApiProvider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProvider(null);
    // Refresh provider status after modal closes
    loadProviderStatus();
  };

  const handleTestChat = (provider: AiProvider) => {
    setTestChatProvider(provider);
  };

  const handleTestSerp = (provider: 'serp' | 'serpstack') => {
    setTestSerpProvider(provider);
  };

  const handleDefaultProviderChange = (value: string) => {
    try {
      localStorage.setItem('defaultAiProvider', value);
      setDefaultProvider(value);
      toast.success(`Default AI provider set to ${value}`);
    } catch (error) {
      toast.error('Failed to set default provider');
    }
  };

  const configuredAiProviders = aiProviders.filter(p => configuredProviders[p.id]);
  const availableAiProviders = aiProviders.filter(p => !configuredProviders[p.id]);
  const configuredSerpProviders = serpProviders.filter(p => configuredProviders[p.id]);
  const availableSerpProviders = serpProviders.filter(p => !configuredProviders[p.id]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">API Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your API integrations</p>
      </div>

      {/* Default AI Provider Selection */}
      {configuredAiProviders.length > 0 && (
        <div className="p-4 border rounded-lg bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Default AI Provider</h3>
              <p className="text-sm text-muted-foreground">Choose which AI provider to use by default</p>
            </div>
            <Select value={defaultProvider} onValueChange={handleDefaultProviderChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select default provider" />
              </SelectTrigger>
              <SelectContent>
                {configuredAiProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.icon} {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Providers Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              🤖 AI Providers
              <Badge variant="secondary">{configuredAiProviders.length} configured</Badge>
            </h2>
          </div>

          <div className="space-y-3">
            {aiProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                name={provider.name}
                icon={provider.icon}
                isConfigured={configuredProviders[provider.id] || false}
                provider={provider.id as ApiProvider}
                category="ai"
                onClick={() => handleProviderConfigure(provider.id as ApiProvider)}
                onTest={() => handleTestChat(provider.id as AiProvider)}
              />
            ))}
          </div>

          {availableAiProviders.length > 0 && (
            <Dialog>
              <Button variant="outline" className="w-full" asChild>
                <div className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add AI Provider
                </div>
              </Button>
            </Dialog>
          )}
        </div>

        {/* SERP Providers Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              🔍 Search Providers
              <Badge variant="secondary">{configuredSerpProviders.length} configured</Badge>
            </h2>
          </div>

          <div className="space-y-3">
            {serpProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                name={provider.name}
                icon={provider.icon}
                isConfigured={configuredProviders[provider.id] || false}
                provider={provider.id as ApiProvider}
                category="serp"
                onClick={() => handleProviderConfigure(provider.id as ApiProvider)}
                onTest={
                  (provider.id === 'serp' || provider.id === 'serpstack') 
                    ? () => handleTestSerp(provider.id as 'serp' | 'serpstack')
                    : undefined
                }
              />
            ))}
          </div>

          {availableSerpProviders.length > 0 && (
            <Dialog>
              <Button variant="outline" className="w-full" asChild>
                <div className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Search Provider
                </div>
              </Button>
            </Dialog>
          )}
        </div>
      </div>

      <ConfigurationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        provider={selectedProvider}
      />

      <AIChatTestModal
        isOpen={!!testChatProvider}
        onClose={() => setTestChatProvider(null)}
        provider={testChatProvider}
      />

      <SERPTestModal
        isOpen={!!testSerpProvider}
        onClose={() => setTestSerpProvider(null)}
        provider={testSerpProvider}
      />
    </div>
  );
}