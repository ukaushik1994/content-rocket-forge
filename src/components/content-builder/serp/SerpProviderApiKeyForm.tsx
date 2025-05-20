
import React, { useState, useEffect } from 'react';
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
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  // Check if API key exists
  useEffect(() => {
    const serpApiKey = localStorage.getItem('serp_api_key');
    
    if (serpApiKey) {
      setHasApiKey(true);
      onProviderConfigured?.('serpapi');
    }
  }, [onProviderConfigured]);

  // Handle when a provider is successfully configured
  const handleProviderConfigured = () => {
    setHasApiKey(true);
    onProviderConfigured?.('serpapi');
  };
  
  return (
    <div>
      <SerpApiKeySetup onConfigured={handleProviderConfigured} />
      
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
