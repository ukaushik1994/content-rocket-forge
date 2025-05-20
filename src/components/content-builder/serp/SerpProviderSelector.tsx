
import React from 'react';
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
  
  // Filter providers to only show those with API keys configured
  const availableProviders = React.useMemo(() => {
    const providers = SERP_PROVIDERS.filter(provider => {
      // Always include the mock provider as it doesn't need an API key
      if (provider.id === 'mock') return true;
      
      // For other providers, check if API key exists
      switch(provider.id) {
        case 'serpapi':
          return localStorage.getItem('serp_api_key') !== null;
        case 'dataforseo':
          return localStorage.getItem('dataforseo_api_key') !== null;
        default:
          return false;
      }
    });
    
    return providers.length > 0 ? providers : SERP_PROVIDERS;
  }, []);

  return (
    <div className={className}>
      <Select value={selectedProvider} onValueChange={handleProviderChange}>
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent>
          {availableProviders.map((provider) => (
            <SelectItem key={provider.id} value={provider.id} className="flex items-center">
              <div className="flex items-center">
                {getProviderIcon(provider.id)}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{provider.name}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{provider.description}</p>
                    {provider.requiresKey && (
                      <p className="text-xs text-amber-400 mt-1">Requires API key</p>
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
