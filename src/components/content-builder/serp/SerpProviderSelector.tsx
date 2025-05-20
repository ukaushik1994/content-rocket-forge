
import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, 
  CloudCog, 
  CloudLightning
} from 'lucide-react';
import { 
  SerpProvider, 
  SERP_PROVIDERS 
} from '@/contexts/content-builder/types/serp-types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getPreferredSerpProvider, setPreferredSerpProvider } from '@/services/serpApiService';

interface SerpProviderSelectorProps {
  onProviderChange?: (provider: SerpProvider) => void;
  className?: string;
}

export const SerpProviderSelector: React.FC<SerpProviderSelectorProps> = ({
  onProviderChange,
  className = ''
}) => {
  const [selectedProvider, setSelectedProvider] = React.useState<SerpProvider>(
    getPreferredSerpProvider()
  );
  
  // Effect to check available providers based on API keys
  useEffect(() => {
    const checkApiKeys = () => {
      const serpApiKey = localStorage.getItem('serp_api_key');
      const dataForSeoKey = localStorage.getItem('dataforseo_api_key');
      
      // If there's no API key for the selected provider but there's one for another,
      // switch to the available one
      if (selectedProvider === 'serpapi' && !serpApiKey && dataForSeoKey) {
        handleProviderChange('dataforseo');
      } else if (selectedProvider === 'dataforseo' && !dataForSeoKey && serpApiKey) {
        handleProviderChange('serpapi');
      } else if (!serpApiKey && !dataForSeoKey && selectedProvider !== 'mock') {
        // If no API keys available, default to mock
        handleProviderChange('mock');
      }
    };
    
    checkApiKeys();
  }, [selectedProvider]);

  const handleProviderChange = (value: string) => {
    const provider = value as SerpProvider;
    setSelectedProvider(provider);
    setPreferredSerpProvider(provider);
    if (onProviderChange) {
      onProviderChange(provider);
    }
  };

  // Get provider icon based on the provider ID
  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'serpapi':
        return <CloudLightning className="h-4 w-4 mr-2 text-blue-400" />;
      case 'dataforseo':
        return <CloudCog className="h-4 w-4 mr-2 text-green-400" />;
      case 'mock':
        return <Database className="h-4 w-4 mr-2 text-orange-400" />;
      default:
        return <Database className="h-4 w-4 mr-2 text-gray-400" />;
    }
  };

  // Check if a provider is available (has API key or is mock)
  const isProviderAvailable = (providerId: string): boolean => {
    if (providerId === 'mock') return true;
    if (providerId === 'serpapi') return !!localStorage.getItem('serp_api_key');
    if (providerId === 'dataforseo') return !!localStorage.getItem('dataforseo_api_key');
    return false;
  };

  return (
    <div className={className}>
      <Select value={selectedProvider} onValueChange={handleProviderChange}>
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent>
          {SERP_PROVIDERS.map((provider) => (
            <SelectItem 
              key={provider.id} 
              value={provider.id} 
              className="flex items-center"
              disabled={!isProviderAvailable(provider.id)}
            >
              <div className="flex items-center">
                {getProviderIcon(provider.id)}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{provider.name}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{provider.description}</p>
                    {provider.requiresKey && !isProviderAvailable(provider.id) && (
                      <p className="text-xs text-amber-400 mt-1">API key required</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
