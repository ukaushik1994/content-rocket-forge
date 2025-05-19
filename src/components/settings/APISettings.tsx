
import React, { useState, useEffect } from 'react';
import { AvailableProviders } from './api/AvailableProviders';
import { ApiSettingsHeader } from './api/ApiSettingsHeader';
import { API_PROVIDERS } from './api/types';
import { DefaultAiProviderSelector } from './api/DefaultAiProviderSelector';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { toast } from 'sonner';
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
import { StandardApiProvider, DataForSeoProvider } from '@/components/api';

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
    const loadPreferences = async () => {
      const savedProvider = await getUserPreference('defaultAiProvider');
      if (savedProvider) {
        setDefaultAiProvider(savedProvider);
      } else {
        // Default to OpenAI if no preference is set
        setDefaultAiProvider('openai');
      }
      
      // Get usage stats
      const serpUsage = getTotalUsageStats();
      setTotalSerpQueries(serpUsage);
    };
    
    loadPreferences();
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

  const renderProvider = (provider: typeof API_PROVIDERS[0]) => {
    if (provider.type === 'credentials') {
      return <DataForSeoProvider key={provider.id} provider={provider} />;
    }
    return <StandardApiProvider key={provider.id} provider={provider} />;
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
              .map(provider => renderProvider(provider))}
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
            {filteredProviders
              .filter(p => p.category === 'serp')
              .map(provider => renderProvider(provider))}
          </div>
          
          <AvailableProviders 
            providers={availableProviders.filter(p => p.category === 'serp')} 
            onToggleProvider={handleProviderToggle} 
          />
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
              .map(provider => renderProvider(provider))}
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
