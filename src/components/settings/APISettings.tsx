
import React, { useState } from 'react';
import { ApiKeyInput } from './api/ApiKeyInput';
import { AvailableProviders } from './api/AvailableProviders';
import { ApiSettingsHeader } from './api/ApiSettingsHeader';
import { API_PROVIDERS } from './api/types';

export function APISettings() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    API_PROVIDERS.filter(p => p.required).map(p => p.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const filteredProviders = API_PROVIDERS.filter(provider => 
    (provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     provider.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (provider.required || selectedProviders.includes(provider.id))
  );

  const availableProviders = API_PROVIDERS.filter(p => 
    !p.required && !selectedProviders.includes(p.id)
  );

  return (
    <div className="space-y-6">
      <ApiSettingsHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onDisplayOptionChange={handleDisplayOptionChange}
      />

      <div className="space-y-4">
        {filteredProviders.map(provider => (
          <ApiKeyInput key={provider.id} provider={provider} />
        ))}
      </div>

      <AvailableProviders 
        providers={availableProviders} 
        onToggleProvider={handleProviderToggle} 
      />
    </div>
  );
}
