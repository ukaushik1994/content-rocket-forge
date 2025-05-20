
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertTriangle, AlertCircle, Settings } from 'lucide-react';
import { ApiProviderConfig } from './types';
import { useApiCredentials } from '@/components/api-credentials/ApiCredentialsProvider';

interface ApiProviderCardProps {
  provider: ApiProviderConfig;
  onClick?: () => void;
}

export const ApiProviderCard: React.FC<ApiProviderCardProps> = ({ provider, onClick }) => {
  const { getProviderStatus } = useApiCredentials();
  const status = getProviderStatus(provider.id);
  
  // Get status icon and color
  const getStatusIcon = () => {
    if (!status) return null;
    
    switch(status.status) {
      case 'connected':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'not-verified':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-primary" />;
      default:
        return null;
    }
  };
  
  return (
    <Card 
      className={`border border-white/10 shadow-lg hover:border-white/20 cursor-pointer transition-all`} 
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{provider.name}</CardTitle>
          {getStatusIcon()}
        </div>
        <CardDescription>
          {provider.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        {status?.status === 'connected' ? (
          <div className="bg-green-500/10 text-green-400 text-sm px-3 py-2 rounded-md">
            Connected and verified
          </div>
        ) : status?.status === 'not-verified' ? (
          <div className="bg-amber-500/10 text-amber-400 text-sm px-3 py-2 rounded-md">
            Connected but not verified
          </div>
        ) : status?.status === 'error' ? (
          <div className="bg-red-500/10 text-red-400 text-sm px-3 py-2 rounded-md">
            Connection error
          </div>
        ) : (
          <div className="bg-white/5 text-white/60 text-sm px-3 py-2 rounded-md">
            Not configured
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </CardFooter>
    </Card>
  );
};
