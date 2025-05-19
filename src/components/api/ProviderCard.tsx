
import React from 'react';
import { Card } from "@/components/ui/card";
import { 
  Database, Key, Zap, Server, 
  CircleCheck, AlertCircle, AlertTriangle 
} from 'lucide-react';
import { ApiProviderConfig } from '../settings/api/types';

export interface ProviderCardProps {
  provider: ApiProviderConfig;
  children: React.ReactNode;
  status?: 'connected' | 'not-verified' | 'error' | 'required' | 'loading' | 'none';
  className?: string;
}

export const ProviderCard = ({
  provider,
  children,
  status = 'none',
  className = '',
}: ProviderCardProps) => {
  const statusColors = {
    connected: 'border-green-500/40 border-l-4 border-l-green-500',
    'not-verified': 'border-yellow-500/40 border-l-4 border-l-yellow-500',
    error: 'border-red-500/40 border-l-4 border-l-red-500',
    required: 'border-red-500/40',
    loading: 'border-blue-500/40',
    none: 'border-white/10'
  };

  return (
    <Card className={`border shadow-lg ${statusColors[status]} ${className}`}>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </Card>
  );
};

export const getProviderIcon = (serviceKey?: string) => {
  switch(serviceKey) {
    case 'openai':
      return <Zap className="h-5 w-5 text-blue-500" />;
    case 'serp':
    case 'serpapi':
    case 'dataforseo':
      return <Database className="h-5 w-5 text-blue-500" />;
    case 'anthropic':
      return <Server className="h-5 w-5 text-blue-500" />;
    case 'gemini':
    case 'mistral':
      return <Key className="h-5 w-5 text-blue-500" />;
    default:
      return <Key className="h-5 w-5 text-blue-500" />;
  }
};

export const getStatusIcon = (status: string) => {
  switch(status) {
    case 'connected':
      return <CircleCheck className="h-4 w-4 text-green-500" />;
    case 'not-verified':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

export const getStatusBadge = (status: string) => {
  switch(status) {
    case 'connected':
      return <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full">Connected</span>;
    case 'not-verified':
      return <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full">Not Verified</span>;
    case 'error':
      return <span className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded-full">Error</span>;
    case 'required':
      return <span className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded-full">Required</span>;
    default:
      return null;
  }
};
