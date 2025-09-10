import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Settings2, Zap, Search, MessageSquare, RefreshCw, Loader2, Brain, Binary, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { ApiKeyInput } from './api/ApiKeyInput';
import { DefaultAiProviderSelector } from './api/DefaultAiProviderSelector';
import AIServiceController, { ProviderInfo } from '@/services/aiService/AIServiceController';
import { ApiProvider } from './api/types';
import { getAllApiKeysStatus, testAllApiKeys, ApiKeyStatusResult, ApiKeyStatus } from '@/services/apiKeys';
import { getUserPreference } from '@/services/userPreferencesService';
import { AIChatTestModal } from './modals/AIChatTestModal';
import { SERPTestModal } from './modals/SERPTestModal';
import { ApiKeyDebugModal } from './debug/ApiKeyDebugModal';
import { UsageSection } from './UsageSection';
import { AIServiceToggle } from './AIServiceToggle';
import { ProviderManagement } from './ProviderManagement';
import { AIGenerationTest } from '@/components/ai/AIGenerationTest';
const StatusDot = ({
  status
}: {
  status: ApiKeyStatus;
}) => {
  const colors = {
    'not-configured': 'bg-muted-foreground',
    'configured': 'bg-warning',
    'verified': 'bg-success'
  };
  return <div className={`w-2 h-2 rounded-full ${colors[status]}`} />;
};
const ProviderCard = ({
  provider,
  statusResult,
  onConfigure,
  onTest
}: {
  provider: ApiProvider;
  statusResult: ApiKeyStatusResult;
  onConfigure: () => void;
  onTest?: () => void;
}) => {
  const isConfigured = statusResult.status !== 'not-configured';
  const getStatusText = (status: ApiKeyStatus) => {
    switch (status) {
      case 'not-configured':
        return 'Not configured';
      case 'configured':
        return 'Configured (untested)';
      case 'verified':
        return 'Verified & working';
    }
  };
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <provider.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-sm">{provider.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusDot status={statusResult.status} />
                <span className="text-xs text-muted-foreground">
                  {getStatusText(statusResult.status)}
                </span>
                {statusResult.error && <span className="text-xs text-destructive" title={statusResult.error}>⚠️</span>}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onConfigure}>
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Test Button for configured providers */}
        {isConfigured && onTest && <div className="mt-3 pt-3 border-t">
            <Button variant="outline" size="sm" className="w-full" onClick={onTest}>
              {provider.category === 'AI Services' ? <>
                  <MessageSquare className="h-3 w-3 mr-2" />
                  Test Chat
                </> : <>
                  <Search className="h-3 w-3 mr-2" />
                  Test Search
                </>}
            </Button>
          </div>}
      </CardContent>
    </Card>
  </motion.div>;
};
const ConfigurationModal = ({
  provider,
  isOpen,
  onClose
}: {
  provider: ApiProvider | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!provider) return null;
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <provider.icon className="h-5 w-5" />
            Configure {provider.name}
          </DialogTitle>
          <DialogDescription>
            {provider.description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ApiKeyInput provider={provider} />
        </div>
      </DialogContent>
    </Dialog>;
};
export function MinimalAPISettings() {
  const [configuredProviders, setConfiguredProviders] = useState<Record<string, ApiKeyStatusResult>>({});
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultAiProvider, setDefaultAiProvider] = useState<'openrouter' | 'anthropic' | 'openai' | 'gemini' | 'mistral' | 'lmstudio' | undefined>();
  const [isTestingAll, setIsTestingAll] = useState(false);

  // Test modal states
  const [testProvider, setTestProvider] = useState<string | null>(null);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const [isAITestModalOpen, setIsAITestModalOpen] = useState(false);
  const [isSERPTestModalOpen, setIsSERPTestModalOpen] = useState(false);
  const [allProviders, setAllProviders] = useState<ProviderInfo[]>([]);

  // Load providers from AIServiceController
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providers = await AIServiceController.getAllProviders();
        setAllProviders(providers);
      } catch (error) {
        console.error('Failed to load providers:', error);
      }
    };
    loadProviders();
  }, []);

  // Separate AI and SERP providers
  const aiProviders = allProviders.filter(p => p.category === 'AI Services');
  const serpProviders = allProviders.filter(p => p.category === 'SEO & Analytics');

  // Convert ProviderInfo to ApiProvider for compatibility
  const convertToApiProvider = (provider: ProviderInfo): ApiProvider => ({
    id: provider.id,
    name: provider.name,
    description: provider.description,
    serviceKey: provider.id,
    icon: provider.icon_name === 'brain' ? Brain : provider.icon_name === 'message-square' ? MessageSquare : provider.icon_name === 'binary' ? Binary : provider.icon_name === 'server' ? Server : provider.icon_name === 'search' ? Search : Brain,
    link: provider.setup_url,
    required: provider.is_required,
    category: provider.category
  });
  useEffect(() => {
    const loadProviderStatus = async () => {
      try {
        const status = await getAllApiKeysStatus();
        setConfiguredProviders(status);
      } catch (error) {
        console.error('Failed to load provider status:', error);
      }
    };
    const loadDefaultProvider = async () => {
      const defaultProvider = getUserPreference('defaultAiProvider');
      setDefaultAiProvider(defaultProvider || 'openrouter');
    };
    loadProviderStatus();
    loadDefaultProvider();
  }, []);
  const handleProviderConfigure = (provider: ApiProvider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProvider(null);
    // Only refresh basic status after configuration (no testing)
    getAllApiKeysStatus().then(setConfiguredProviders);
  };
  const handleTestAllProviders = async () => {
    setIsTestingAll(true);
    try {
      const status = await testAllApiKeys();
      setConfiguredProviders(status);
    } catch (error) {
      console.error('Failed to test providers:', error);
    } finally {
      setIsTestingAll(false);
    }
  };
  const handleTestProvider = (provider: ApiProvider) => {
    setTestProvider(provider.serviceKey);
    if (provider.category === 'AI Services') {
      setIsAITestModalOpen(true);
    } else if (provider.category === 'SEO & Analytics') {
      setIsSERPTestModalOpen(true);
    }
  };
  const handleTestModalClose = () => {
    setIsAITestModalOpen(false);
    setIsSERPTestModalOpen(false);
    setTestProvider(null);
  };
  const handleTestComplete = async (provider: string, success: boolean) => {
    // Update the provider status immediately
    setConfiguredProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        status: success ? 'verified' : 'configured',
        error: success ? undefined : 'Test failed'
      }
    }));
  };

  // Show all providers, not just configured ones
  const allAiProviders = aiProviders;
  const allSerpProviders = serpProviders;
  return <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">API Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your API integrations</p>
      </div>

      {/* Usage Analytics Section - Top Priority */}
      <UsageSection />

      {/* AI Service Toggle */}
      <AIServiceToggle />

      {/* Default AI Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Default AI Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DefaultAiProviderSelector defaultAiProvider={defaultAiProvider} onDefaultAiProviderChange={setDefaultAiProvider} />
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Providers Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI Providers
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button onClick={handleTestAllProviders} disabled={isTestingAll} variant="outline" size="sm">
                    {isTestingAll ? <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Testing...
                      </> : <>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Test All
                      </>}
                  </Button>
                  <Badge variant="secondary">
                    {allAiProviders.filter(p => configuredProviders[p.id]?.status !== 'not-configured').length} configured
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {allAiProviders.map(provider => <ProviderCard key={provider.id} provider={convertToApiProvider(provider)} statusResult={configuredProviders[provider.id] || {
              status: 'not-configured'
            }} onConfigure={() => handleProviderConfigure(convertToApiProvider(provider))} onTest={() => handleTestProvider(convertToApiProvider(provider))} />)}
            </CardContent>
          </Card>
        </div>

        {/* SERP Providers Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Providers
                </CardTitle>
                <Badge variant="secondary">
                  {allSerpProviders.filter(p => configuredProviders[p.id]?.status !== 'not-configured').length} configured
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {allSerpProviders.map(provider => <ProviderCard key={provider.id} provider={convertToApiProvider(provider)} statusResult={configuredProviders[provider.id] || {
              status: 'not-configured'
            }} onConfigure={() => handleProviderConfigure(convertToApiProvider(provider))} onTest={() => handleTestProvider(convertToApiProvider(provider))} />)}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Provider Management Section */}
      <ProviderManagement />

      {/* AI Generation Test - Remove this after testing */}
      

      {/* Configuration Modal */}
      <ConfigurationModal provider={selectedProvider} isOpen={isModalOpen} onClose={handleModalClose} />

      {/* Test Modals */}
      <AIChatTestModal provider={testProvider} isOpen={isAITestModalOpen} onClose={handleTestModalClose} onTestComplete={handleTestComplete} />
      
      <SERPTestModal provider={testProvider} isOpen={isSERPTestModalOpen} onClose={handleTestModalClose} />
    </div>;
}