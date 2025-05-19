
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
import { Trash, Search, RefreshCw, LayoutDashboard } from 'lucide-react';
import { StandardApiProvider, DataForSeoProvider } from '@/components/api';
import { ProviderDashboard } from '@/components/api/ProviderDashboard';

export function APISettings() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    API_PROVIDERS.filter(p => p.required).map(p => p.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [defaultAiProvider, setDefaultAiProvider] = useState<'openai' | 'anthropic' | 'gemini' | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState('dashboard');
  const [totalSerpQueries, setTotalSerpQueries] = useState(0);
  const [providerStatuses, setProviderStatuses] = useState<Record<string, 'connected' | 'not-verified' | 'error' | 'required' | 'loading' | 'none'>>({});
  
  // Load default AI provider from user preferences and provider statuses
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
      
      // Load initial statuses (simulated - would normally come from API)
      const initialStatuses: Record<string, any> = {};
      API_PROVIDERS.forEach(provider => {
        // In a real app, you would fetch the actual status from your API service
        initialStatuses[provider.id] = provider.required ? 'required' : 'none';
      });
      setProviderStatuses(initialStatuses);
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
  
  const handleProviderClick = (providerId: string) => {
    // Find the category of the provider
    const provider = API_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setActiveTab(provider.category);
      // Ensure the provider is in the selected list
      if (!selectedProviders.includes(providerId)) {
        setSelectedProviders(prev => [...prev, providerId]);
      }
      // Focus on the provider card after a short delay to allow tab change
      setTimeout(() => {
        const element = document.getElementById(`provider-${providerId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-animation');
          setTimeout(() => {
            element.classList.remove('highlight-animation');
          }, 1500);
        }
      }, 100);
    }
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
      return (
        <div id={`provider-${provider.id}`} key={provider.id}>
          <DataForSeoProvider provider={provider} />
        </div>
      );
    }
    return (
      <div id={`provider-${provider.id}`} key={provider.id}>
        <StandardApiProvider provider={provider} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="ai">AI Providers</TabsTrigger>
          <TabsTrigger value="serp">SERP Providers</TabsTrigger>
          <TabsTrigger value="other">Other Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <ProviderDashboard 
            providers={API_PROVIDERS} 
            statuses={providerStatuses}
            onProviderClick={handleProviderClick}
          />
          
          <DefaultAiProviderSelector 
            defaultAiProvider={defaultAiProvider} 
            onDefaultAiProviderChange={handleDefaultAiProviderChange} 
          />
          
          <Card className="border border-white/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">SERP Provider Usage</CardTitle>
              <CardDescription>
                Manage search engine data usage and caching
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
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-6">
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
          <ApiSettingsHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onDisplayOptionChange={handleDisplayOptionChange}
            title="SERP Providers"
            description="Configure search engine data providers"
          />
          
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
      
      <style jsx global>{`
        .highlight-animation {
          animation: highlight 1.5s ease;
        }
        
        @keyframes highlight {
          0%, 100% {
            box-shadow: 0 0 0 0 transparent;
          }
          50% {
            box-shadow: 0 0 0 4px rgba(132, 90, 223, 0.6);
          }
        }
      `}</style>
    </div>
  );
}
