
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { getProviderIcon, getStatusBadge } from './ProviderCard';
import { ApiProviderConfig } from '../settings/api/types';
import { toast } from "sonner";

export interface ProviderHeaderProps {
  provider: ApiProviderConfig;
  status: 'connected' | 'not-verified' | 'error' | 'required' | 'loading' | 'none';
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

export const ProviderHeader = ({ 
  provider, 
  status,
  isActive,
  setIsActive,
}: ProviderHeaderProps) => {
  const handleToggleActive = async () => {
    const newActive = !isActive;
    setIsActive(newActive);
    
    // In a real implementation, we would update the active status in the database
    toast.success(`${provider.name} API ${newActive ? 'enabled' : 'disabled'} successfully`);
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-md ${status === 'connected' ? 'bg-green-500/10' : 'bg-primary/10'}`}>
          {getProviderIcon(provider.serviceKey)}
        </div>
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            {provider.name} API
            {getStatusBadge(status)}
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
          disabled={status === 'none' || status === 'error' || status === 'loading'}
        />
      </div>
    </div>
  );
};
