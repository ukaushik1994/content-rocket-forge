
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SerpProviderSelector } from '@/components/content-builder/serp/SerpProviderSelector';
import { SERP_PROVIDERS, SerpProvider } from '@/contexts/content-builder/types/serp-types';
import { Button } from '@/components/ui/button';
import { useApiCredentials } from '@/hooks/useApiCredentials';
import { getPreferredSerpProvider, setPreferredSerpProvider } from '@/services/serpApiService';
import { toast } from 'sonner';

export const SerpProvidersPanel = () => {
  const [selectedProvider, setSelectedProvider] = useState<SerpProvider>(getPreferredSerpProvider());
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([]);

  // Check which providers have API keys configured
  useEffect(() => {
    const checkConfiguredProviders = () => {
      const providers: string[] = [];
      
      // Check localStorage for API keys
      if (localStorage.getItem('serp_api_key')) {
        providers.push('serpapi');
      }
      
      if (localStorage.getItem('dataforseo_api_key')) {
        providers.push('dataforseo');
      }
      
      setConfiguredProviders(providers);
    };
    
    checkConfiguredProviders();
  }, []);

  // Handle provider change
  const handleProviderChange = (provider: SerpProvider) => {
    setSelectedProvider(provider);
    setPreferredSerpProvider(provider);
    toast.success(`SERP provider set to ${SERP_PROVIDERS.find(p => p.id === provider)?.name}`);
  };

  // Get configuration status for a provider
  const getProviderStatus = (providerId: SerpProvider) => {
    if (configuredProviders.includes(providerId)) {
      return <span className="text-green-500 text-sm">Configured</span>;
    }
    return <span className="text-amber-500 text-sm">Not configured</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">SERP Providers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="mb-4">Select your preferred SERP provider for keyword analysis and research:</p>
          
          <div className="flex items-center gap-4">
            <SerpProviderSelector 
              onProviderChange={handleProviderChange}
              className="w-full max-w-xs"
            />
            <div>
              <p className="text-sm text-muted-foreground">
                Current provider: <span className="font-medium text-primary">{SERP_PROVIDERS.find(p => p.id === selectedProvider)?.name}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Available Providers</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERP_PROVIDERS.filter(p => p.requiresKey).map(provider => (
              <div key={provider.id} className="flex items-center justify-between border border-border rounded-lg p-4">
                <div>
                  <h4 className="font-medium">{provider.name}</h4>
                  <p className="text-sm text-muted-foreground">{provider.description}</p>
                  <div className="mt-1">
                    {getProviderStatus(provider.id as SerpProvider)}
                  </div>
                </div>
                <div>
                  {configuredProviders.includes(provider.id) ? (
                    <Button
                      variant={selectedProvider === provider.id ? "default" : "outline"}
                      onClick={() => handleProviderChange(provider.id as SerpProvider)}
                    >
                      {selectedProvider === provider.id ? "Selected" : "Select"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const activeTab = document.getElementById(provider.id);
                        if (activeTab) {
                          activeTab.click();
                        }
                      }}
                    >
                      Configure
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
