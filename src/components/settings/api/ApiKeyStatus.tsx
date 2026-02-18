
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Check, AlertCircle } from 'lucide-react';
import { ApiProvider } from './types';

interface ApiKeyStatusProps {
  provider: ApiProvider;
  keyExists: boolean;
  testSuccessful: boolean;
}

export const ApiKeyStatus = ({ 
  provider, 
  keyExists, 
  testSuccessful 
}: ApiKeyStatusProps) => {
  if (provider.required && !keyExists) {
    return (
      <Alert variant="destructive" className="bg-transparent border-red-500/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>API Key Required</AlertTitle>
        <AlertDescription>
          This API key is required for the content analysis features to work properly. 
          Without it, the application will show "No data found" instead of mock data.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (keyExists && testSuccessful) {
    return (
      <Alert className="bg-transparent border-green-500/20">
        <Check className="h-4 w-4 text-green-500" />
        <AlertTitle>API Connected</AlertTitle>
        <AlertDescription>
          Your {provider.name} API key is working correctly. Real data will be used for content analysis.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};
