
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiCredentials } from '@/components/api-credentials/ApiCredentialsProvider';
import { ApiProviderCard } from '@/components/settings/api/ApiProviderCard';
import { ProviderDashboard } from '@/components/api/ProviderDashboard';
import { DataForSeoProvider } from '@/components/api/DataForSeoProvider';
import { SerpProvidersPanel } from '@/components/settings/api/SerpProvidersPanel';
import { ApiProviderConfig } from './types';

/**
 * Content component for the API Settings page
 */
export const ApiSettingsContent: React.FC = () => {
  // Use our API credentials context to access data
  const { 
    apiCredentials, 
    providers, 
    isLoading, 
    error, 
    refreshCredentials, 
    getProviderStatus 
  } = useApiCredentials();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Group providers by category
  const serpProviders = providers.filter(p => p.category === 'serp');
  const aiProviders = providers.filter(p => p.category === 'ai');
  const otherProviders = providers.filter(p => p.category === 'other');
  
  // Create a map of provider statuses
  const providerStatuses = providers.reduce((acc, provider) => {
    const credential = apiCredentials.find(c => c.provider === provider.id);
    acc[provider.id] = credential?.status || 'none';
    return acc;
  }, {} as Record<string, any>);

  // Handle provider selection
  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setActiveTab('providers');
  };

  // Render provider based on ID
  const renderProvider = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return null;

    if (provider.id === 'dataforseo') {
      return <DataForSeoProvider provider={provider} />;
    }

    // Generic provider display
    return <ApiProviderCard provider={provider} />;
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="serp">SERP Providers</TabsTrigger>
          <TabsTrigger value="settings">General Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <ProviderDashboard 
            providers={providers} 
            statuses={providerStatuses}
            onProviderClick={handleProviderSelect}
          />
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium">AI Providers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiProviders.map(provider => (
                <ApiProviderCard 
                  key={provider.id} 
                  provider={provider} 
                  onClick={() => handleProviderSelect(provider.id)}
                />
              ))}
            </div>
            
            <h3 className="text-lg font-medium mt-8">SERP Providers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serpProviders.map(provider => (
                <ApiProviderCard 
                  key={provider.id} 
                  provider={provider} 
                  onClick={() => handleProviderSelect(provider.id)}
                />
              ))}
            </div>
            
            {otherProviders.length > 0 && (
              <>
                <h3 className="text-lg font-medium mt-8">Other Providers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherProviders.map(provider => (
                    <ApiProviderCard 
                      key={provider.id} 
                      provider={provider} 
                      onClick={() => handleProviderSelect(provider.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="providers">
          {selectedProvider ? (
            renderProvider(selectedProvider)
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Select a provider from the dashboard to configure it</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="serp">
          <SerpProvidersPanel />
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                General settings for API providers will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
