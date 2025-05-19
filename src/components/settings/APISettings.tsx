
import React, { useState, useEffect } from 'react';
import { ApiKeyInput } from './api/ApiKeyInput';
import { DataForSeoApiKeyInput } from './api/DataForSeoApiKeyInput';
import { AvailableProviders } from './api/AvailableProviders';
import { ApiSettingsHeader } from './api/ApiSettingsHeader';
import { API_PROVIDERS } from './api/types';
import { DefaultAiProviderSelector } from './api/DefaultAiProviderSelector';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { toast } from 'sonner';

export function APISettings() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    API_PROVIDERS.filter(p => p.required).map(p => p.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [defaultAiProvider, setDefaultAiProvider] = useState<'openai' | 'anthropic' | 'gemini' | undefined>(
    undefined
  );
  
  // Load default AI provider from user preferences
  useEffect(() => {
    const savedProvider = getUserPreference('defaultAiProvider');
    if (savedProvider) {
      setDefaultAiProvider(savedProvider);
    } else {
      // Default to OpenAI if no preference is set
      setDefaultAiProvider('openai');
    }
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
      
      <DefaultAiProviderSelector 
        defaultAiProvider={defaultAiProvider} 
        onDefaultAiProviderChange={handleDefaultAiProviderChange} 
      />

      <div className="space-y-4">
        {filteredProviders.map(provider => (
          provider.id === 'dataforseo' ? (
            <DataForSeoApiKeyInput key={provider.id} provider={provider} />
          ) : (
            <ApiKeyInput key={provider.id} provider={provider} />
          )
        ))}
      </div>

      <AvailableProviders 
        providers={availableProviders} 
        onToggleProvider={handleProviderToggle} 
      />
    </div>
  );
}
