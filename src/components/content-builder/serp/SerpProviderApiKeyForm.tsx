
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SerpApiKeySetup } from './SerpApiKeySetup';
import { DataForSeoApiSetup } from './DataForSeoApiSetup';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';

interface SerpProviderApiKeyFormProps {
  onContinueWithMock: () => void;
  onProviderConfigured?: (provider: SerpProvider) => void;
}

export const SerpProviderApiKeyForm: React.FC<SerpProviderApiKeyFormProps> = ({
  onContinueWithMock,
  onProviderConfigured
}) => {
  const [activeTab, setActiveTab] = useState<SerpProvider>('serpapi');
  const [hasAnyApiKey, setHasAnyApiKey] = useState<boolean>(false);
  
  // Check if any API keys exist
  useEffect(() => {
    const serpApiKey = localStorage.getItem('serp_api_key');
    const dataForSeoApiKey = localStorage.getItem('dataforseo_api_key');
    
    if (serpApiKey || dataForSeoApiKey) {
      setHasAnyApiKey(true);
      
      // Set the active tab to the provider that has an API key
      if (serpApiKey) {
        setActiveTab('serpapi');
        onProviderConfigured?.('serpapi');
      } else if (dataForSeoApiKey) {
        setActiveTab('dataforseo');
        onProviderConfigured?.('dataforseo');
      }
    }
  }, [onProviderConfigured]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as SerpProvider);
  };

  // Handle when a provider is successfully configured
  const handleProviderConfigured = (provider: SerpProvider) => {
    setHasAnyApiKey(true);
    onProviderConfigured?.(provider);
  };
  
  return (
    <div>
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full max-w-2xl mx-auto"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="serpapi">SERP API</TabsTrigger>
          <TabsTrigger value="dataforseo">DataForSEO</TabsTrigger>
        </TabsList>
        
        <TabsContent value="serpapi">
          <SerpApiKeySetup onConfigured={() => handleProviderConfigured('serpapi')} />
        </TabsContent>
        
        <TabsContent value="dataforseo">
          <DataForSeoApiSetup />
        </TabsContent>
      </Tabs>
      
      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Don&apos;t want to add an API key now?
        </p>
        <button 
          onClick={onContinueWithMock}
          className="text-sm text-neon-purple hover:text-neon-blue underline mt-1"
        >
          Continue with mock data
        </button>
      </div>
    </div>
  );
};
