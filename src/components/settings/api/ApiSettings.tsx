import React from 'react';
import { SimpleProviderCard } from './SimpleProviderCard';
import { API_PROVIDERS } from './types';

export const ApiSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-2">API Configuration</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure your AI service providers. Add API keys to enable different AI models and services.
        </p>
      </div>

      <div className="space-y-4">
        {API_PROVIDERS.map((provider) => (
          <SimpleProviderCard key={provider.serviceKey} provider={provider} />
        ))}
      </div>
    </div>
  );
};