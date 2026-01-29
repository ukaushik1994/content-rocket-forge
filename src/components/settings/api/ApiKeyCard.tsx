import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApiProvider } from './types';
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

interface ApiKeyCardProps {
  children: React.ReactNode;
  provider: ApiProvider;
  keyExists: boolean;
  testSuccessful: boolean;
  isLoading?: boolean;
  healthStatus?: 'connected' | 'error' | 'not_configured' | 'quota_exceeded' | 'testing';
}

export const ApiKeyCard = ({ 
  children, 
  provider, 
  keyExists, 
  testSuccessful,
  isLoading = false,
  healthStatus
}: ApiKeyCardProps) => {
  const getStatusIndicator = () => {
    if (isLoading) {
      return (
        <Badge variant="outline" className="absolute top-4 right-4 bg-muted/50">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Testing
        </Badge>
      );
    }

    if (healthStatus === 'connected' || testSuccessful) {
      return (
        <Badge variant="outline" className="absolute top-4 right-4 bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      );
    }

    if (healthStatus === 'quota_exceeded') {
      return (
        <Badge variant="outline" className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Quota Exceeded
        </Badge>
      );
    }

    if (healthStatus === 'error' || (keyExists && !testSuccessful)) {
      return (
        <Badge variant="outline" className="absolute top-4 right-4 bg-red-500/20 text-red-400 border-red-500/30">
          <XCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    }

    if (provider.required && !keyExists) {
      return (
        <Badge variant="outline" className="absolute top-4 right-4 bg-red-500/20 text-red-400 border-red-500/30">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Required
        </Badge>
      );
    }

    return null;
  };

  return (
    <Card 
      className={`p-6 space-y-4 bg-glass relative ${
        provider.required && !keyExists 
          ? 'border-red-500/40' 
          : testSuccessful || healthStatus === 'connected'
            ? 'border-green-500/40' 
            : healthStatus === 'error'
              ? 'border-red-500/40'
              : healthStatus === 'quota_exceeded'
                ? 'border-yellow-500/40'
                : 'border-white/10'
      }`}
    >
      {getStatusIndicator()}
      {children}
    </Card>
  );
};
