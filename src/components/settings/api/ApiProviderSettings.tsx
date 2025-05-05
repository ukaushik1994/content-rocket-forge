
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiProviderCard } from './ApiProviderCard';
import { ApiProvider } from './types';

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
  if (providers.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No providers match your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {providers.map(provider => (
        <ApiProviderCard 
          key={provider.id} 
          provider={provider}
          isConfigured={configuredProviders[provider.id] || false}
          onConfigured={(configured) => onProviderConfigured(provider.id, configured)}
        />
      ))}
    </div>
  );
}
