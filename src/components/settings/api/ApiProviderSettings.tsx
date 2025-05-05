
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiProviderCard } from './ApiProviderCard';
import { ApiProvider } from './types';
import { toast } from 'sonner';

interface ApiProviderSettingsProps {
  providers: ApiProvider[];
  configuredProviders: {[key: string]: boolean};
  onProviderConfigured: (providerId: string, configured: boolean) => void;
}

export function ApiProviderSettings({ 
  providers, 
  configuredProviders,
  onProviderConfigured
}: ApiProviderSettingsProps) {
  const [loadingProviders, setLoadingProviders] = useState<{[key: string]: boolean}>({});
  
  // Initialize loading state for all providers
  useEffect(() => {
    const initialLoadingState = providers.reduce((acc, provider) => {
      acc[provider.id] = true;
      return acc;
    }, {} as {[key: string]: boolean});
    
    setLoadingProviders(initialLoadingState);
    
    // Set a timeout to prevent infinite loading state
    const timer = setTimeout(() => {
      setLoadingProviders({});
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [providers]);
  
  // Handler for when a provider finishes loading
  const handleProviderLoaded = (providerId: string) => {
    setLoadingProviders(prev => ({
      ...prev,
      [providerId]: false
    }));
  };
  
  if (providers.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No providers match your search criteria.</p>
      </div>
    );
  }

  // Check if all providers are still loading
  const allProvidersLoading = Object.values(loadingProviders).some(loading => loading);

  return (
    <div className="space-y-4">
      {providers.map(provider => (
        <ApiProviderCard 
          key={provider.id} 
          provider={provider}
          isConfigured={configuredProviders[provider.id] || false}
          onConfigured={(configured) => {
            onProviderConfigured(provider.id, configured);
            handleProviderLoaded(provider.id);
          }}
          isLoading={loadingProviders[provider.id] || false}
        />
      ))}
    </div>
  );
}
