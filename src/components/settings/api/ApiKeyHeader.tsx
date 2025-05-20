
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { ApiProvider } from './types';
import { Zap, Server, Database, Key } from 'lucide-react';
import { toast } from "sonner";

interface ApiKeyHeaderProps {
  provider: ApiProvider;
  keyExists: boolean;
  testSuccessful: boolean;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

export const ApiKeyHeader = ({ 
  provider, 
  keyExists, 
  testSuccessful,
  isActive,
  setIsActive
}: ApiKeyHeaderProps) => {
  // Get the icon based on the service type
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

  const handleToggleActive = async () => {
    const newActive = !isActive;
    setIsActive(newActive);
    
    // In a real implementation, we would update the active status in the database
    toast.success(`${provider.name} API ${newActive ? 'enabled' : 'disabled'} successfully`);
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-md ${testSuccessful ? 'bg-green-500/10' : 'bg-primary/10'}`}>
          {getProviderIcon(provider.serviceKey)}
        </div>
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            {provider.name} API
            {provider.required && !keyExists && (
              <span className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded-full">Required</span>
            )}
            {keyExists && testSuccessful && (
              <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full">Connected</span>
            )}
            {keyExists && !testSuccessful && (
              <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full">Not Verified</span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">{provider.description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex flex-col space-y-0.5">
          <span className="text-xs font-medium">Active</span>
          <span className="text-[10px] text-muted-foreground">
            {isActive ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={handleToggleActive}
          disabled={!keyExists}
        />
      </div>
    </div>
  );
};
