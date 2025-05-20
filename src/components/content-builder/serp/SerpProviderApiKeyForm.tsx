
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SerpApiKeySetup } from './SerpApiKeySetup';
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
    
    if (serpApiKey) {
      setHasAnyApiKey(true);
      setActiveTab('serpapi');
      onProviderConfigured?.('serpapi');
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
      <SerpApiKeySetup onConfigured={() => handleProviderConfigured('serpapi')} />
      
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
