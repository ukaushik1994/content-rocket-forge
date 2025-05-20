
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Server, Database, Key } from 'lucide-react';
import { ApiProvider } from './types';

interface AvailableProvidersProps {
  providers: ApiProvider[];
  onToggleProvider: (providerId: string) => void;
}

export const AvailableProviders = ({ providers, onToggleProvider }: AvailableProvidersProps) => {
  // Add the icon based on the service type
  const getProviderIcon = (serviceKey: string) => {
    switch(serviceKey) {
      case 'openai':
        return <Zap className="h-5 w-5" />;
      case 'serp':
        return <Database className="h-5 w-5" />;
      case 'anthropic':
        return <Server className="h-5 w-5" />;
      case 'gemini':
        return <Key className="h-5 w-5" />;
      default:
        return <Key className="h-5 w-5" />;
    }
  };

  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-border pt-4">
      <h3 className="text-lg font-medium mb-2">Available API Providers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {providers.map(provider => (
          <Card 
            key={provider.id}
            className="p-3 cursor-pointer hover:bg-accent flex items-center gap-3"
            onClick={() => onToggleProvider(provider.id)}
          >
            <div className="p-2 rounded-md bg-primary/10">
              {getProviderIcon(provider.serviceKey)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{provider.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">{provider.description}</p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onToggleProvider(provider.id);
              }}
            >
              Add
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
