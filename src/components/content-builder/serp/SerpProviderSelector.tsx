
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

  return (
    <div className={className}>
      <Select value={selectedProvider} onValueChange={handleProviderChange}>
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent>
          {SERP_PROVIDERS.map((provider) => (
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
