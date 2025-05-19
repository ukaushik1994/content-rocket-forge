
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Check, AlertTriangle, AlertCircle } from 'lucide-react';
import { ApiProviderConfig } from '../settings/api/types';

export interface ProviderStatusProps {
  provider: ApiProviderConfig;
  status: 'connected' | 'not-verified' | 'error' | 'required' | 'loading' | 'none';
  message?: string;
}

export const ProviderStatus = ({ 
  provider, 
  status,
  message
}: ProviderStatusProps) => {
  if (status === 'required') {
    return (
      <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API Key Required</AlertTitle>
        <AlertDescription>
          {message || `This API key is required for the ${provider.name} features to work properly.`}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === 'connected') {
    return (
      <Alert className="bg-green-900/20 border-green-500/30">
        <Check className="h-4 w-4 text-green-500" />
        <AlertTitle>API Connected</AlertTitle>
        <AlertDescription>
          {message || `Your ${provider.name} API key is working correctly. Real data will be used for analysis.`}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === 'error') {
    return (
      <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>
          {message || `There was an error connecting to the ${provider.name} API. Please check your credentials.`}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === 'not-verified') {
    return (
      <Alert className="bg-yellow-900/20 border-yellow-500/30">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertTitle>Connection Not Verified</AlertTitle>
        <AlertDescription>
          {message || `Your ${provider.name} API key has been saved but not verified. Click "Test Connection" to verify.`}
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};
