
import React, { useState, useEffect } from 'react';
import { ApiCredentialCard } from '../api-credentials/ApiCredentialCard';
import { DataForSeoCredentialCard } from '../api-credentials/DataForSeoCredentialCard';
import { AvailableProviders } from './api/AvailableProviders';
import { ApiSettingsHeader } from './api/ApiSettingsHeader';
import { API_PROVIDERS } from './api/types';
import { DefaultAiProviderSelector } from './api/DefaultAiProviderSelector';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { toast } from 'sonner';
import { 
  saveApiKey, 
  deleteApiKey, 
  getApiKey 
} from '@/services/apiKeys/storage';
import { testApiKey } from '@/services/apiKeys/testing';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  clearSerpCache,
  getProviderUsageStats,
  getTotalUsageStats
} from '@/services/serp/SerpApiService';
import { Button } from '@/components/ui/button';
import { Trash, Search, RefreshCw } from 'lucide-react';

export function APISettings() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    API_PROVIDERS.filter(p => p.required).map(p => p.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [defaultAiProvider, setDefaultAiProvider] = useState<'openai' | 'anthropic' | 'gemini' | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState('ai');
  const [totalSerpQueries, setTotalSerpQueries] = useState(0);
  
  // Load default AI provider from user preferences
  useEffect(() => {
    const savedProvider = getUserPreference('defaultAiProvider');
    if (savedProvider) {
      setDefaultAiProvider(savedProvider);
    } else {
      // Default to OpenAI if no preference is set
      setDefaultAiProvider('openai');
    }
    
    // Get usage stats
    const serpUsage = getTotalUsageStats();
    setTotalSerpQueries(serpUsage);
  }, []);
  
  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId) 
        : [...prev, providerId]
    );
  };

  const handleDisplayOptionChange = (value: string) => {
    if (value === "all") {
      setSelectedProviders(API_PROVIDERS.map(p => p.id));
    } else if (value === "none" || value === "required") {
      setSelectedProviders(API_PROVIDERS.filter(p => p.required).map(p => p.id));
    }
  };

  const handleDefaultAiProviderChange = async (provider: 'openai' | 'anthropic' | 'gemini') => {
    setDefaultAiProvider(provider);
    const success = await saveUserPreference('defaultAiProvider', provider);
    if (success) {
      toast.success(`Default AI provider set to ${provider}`);
    } else {
      toast.error('Failed to save default AI provider');
    }
  };
  
  const handleClearSerpCache = () => {
    clearSerpCache();
    toast.success('SERP cache cleared successfully');
  };

  const filteredProviders = API_PROVIDERS.filter(provider => 
    (provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     provider.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (provider.required || selectedProviders.includes(provider.id))
  );

  const availableProviders = API_PROVIDERS.filter(p => 
    !p.required && !selectedProviders.includes(p.id)
  );
  
  // Handle saving an API key
  const handleSaveApiKey = async (providerId: string, key: string) => {
    return await saveApiKey(providerId, key);
  };
  
  // Handle deleting an API key
  const handleDeleteApiKey = async (providerId: string) => {
    return await deleteApiKey(providerId);
  };
  
  // Handle testing an API key
  const handleTestApiKey = async (providerId: string, key: string) => {
    return await testApiKey(providerId, key);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="ai">AI Providers</TabsTrigger>
          <TabsTrigger value="serp">SERP Providers</TabsTrigger>
          <TabsTrigger value="other">Other Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai" className="space-y-6">
          <DefaultAiProviderSelector 
            defaultAiProvider={defaultAiProvider} 
            onDefaultAiProviderChange={handleDefaultAiProviderChange} 
          />
          
          <ApiSettingsHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDisplayOptionChange={handleDisplayOptionChange}
            title="AI Providers"
            description="Configure your AI provider API keys"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProviders
              .filter(p => p.category === 'ai')
              .map(provider => (
                <ApiCredentialCard 
                  key={provider.id}
                  provider={provider}
                  onSave={(key) => handleSaveApiKey(provider.id, key)}
                  onTest={(key) => handleTestApiKey(provider.id, key)}
                  onDelete={() => handleDeleteApiKey(provider.id)}
                />
              ))}
          </div>
          
          <AvailableProviders 
            providers={availableProviders.filter(p => p.category === 'ai')} 
            onToggleProvider={handleProviderToggle} 
          />
        </TabsContent>
        
        <TabsContent value="serp" className="space-y-6">
          <Card className="border border-white/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">SERP Provider Settings</CardTitle>
              <CardDescription>
                Configure search engine data providers and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm text-white/70">Total Queries:</span>
                  <span className="ml-2 font-medium">{totalSerpQueries}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearSerpCache}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ApiCredentialCard 
              provider={{
                id: 'serpapi',
                name: 'SERP API',
                description: 'Provides search engine results data',
                type: 'standard',
                docsUrl: 'https://serpapi.com/docs',
                signupUrl: 'https://serpapi.com/users/sign_up'
              }}
              onSave={(key) => handleSaveApiKey('serpapi', key)}
              onTest={(key) => handleTestApiKey('serpapi', key)}
              onDelete={() => handleDeleteApiKey('serpapi')}
            />
            
            <DataForSeoCredentialCard 
              provider={{
                id: 'dataforseo',
                name: 'DataForSEO',
                description: 'Enterprise SEO data platform',
                type: 'credentials',
                docsUrl: 'https://dataforseo.com/apis',
                signupUrl: 'https://app.dataforseo.com/register'
              }}
              onSave={(key) => handleSaveApiKey('dataforseo', key)}
              onTest={(key) => handleTestApiKey('dataforseo', key)}
              onDelete={() => handleDeleteApiKey('dataforseo')}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="other" className="space-y-6">
          <ApiSettingsHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDisplayOptionChange={handleDisplayOptionChange}
            title="Other Services"
            description="Configure additional API services"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProviders
              .filter(p => p.category === 'other')
              .map(provider => (
                <ApiCredentialCard 
                  key={provider.id}
                  provider={provider}
                  onSave={(key) => handleSaveApiKey(provider.id, key)}
                  onTest={(key) => handleTestApiKey(provider.id, key)}
                  onDelete={() => handleDeleteApiKey(provider.id)}
                />
              ))}
          </div>
          
          <AvailableProviders 
            providers={availableProviders.filter(p => p.category === 'other')} 
            onToggleProvider={handleProviderToggle} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
