
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, AlertTriangle, Clock, Activity } from 'lucide-react';
import { ApiProviderConfig } from '@/components/settings/api/types';

export interface ApiStatusSummary {
  totalProviders: number;
  connected: number;
  notVerified: number;
  error: number;
  required: number;
}

export interface ProviderDashboardProps {
  providers: ApiProviderConfig[];
  statuses: Record<string, 'connected' | 'not-verified' | 'error' | 'required' | 'loading' | 'none'>;
  onProviderClick?: (providerId: string) => void;
}

export const ProviderDashboard = ({ 
  providers, 
  statuses,
  onProviderClick
}: ProviderDashboardProps) => {
  // Calculate status summary
  const statusSummary: ApiStatusSummary = providers.reduce(
    (summary, provider) => {
      const status = statuses[provider.id] || 'none';
      return {
        totalProviders: summary.totalProviders + 1,
        connected: status === 'connected' ? summary.connected + 1 : summary.connected,
        notVerified: status === 'not-verified' ? summary.notVerified + 1 : summary.notVerified,
        error: status === 'error' ? summary.error + 1 : summary.error,
        required: provider.required && status !== 'connected' ? summary.required + 1 : summary.required,
      };
    },
    { totalProviders: 0, connected: 0, notVerified: 0, error: 0, required: 0 }
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'not-verified':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryProviders = (category: string) => {
    return providers.filter(p => p.category === category);
  };

  const categories = ['ai', 'serp', 'other'];
  
  return (
    <Card className="border border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>API Status Dashboard</span>
          <div className="flex items-center gap-2 text-sm font-normal">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span>{statusSummary.connected} Connected</span>
            </span>
            {statusSummary.required > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <span>{statusSummary.required} Required</span>
              </span>
            )}
            {statusSummary.error > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span>{statusSummary.error} Issues</span>
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map(category => {
            const categoryProviders = getCategoryProviders(category);
            if (categoryProviders.length === 0) return null;
            
            return (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-medium capitalize">{category} Providers</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {categoryProviders.map(provider => {
                    const status = statuses[provider.id] || 'none';
                    return (
                      <div 
                        key={provider.id}
                        onClick={() => onProviderClick?.(provider.id)}
                        className={`
                          p-3 rounded-md border cursor-pointer transition-colors
                          ${status === 'connected' ? 'border-green-500/30 bg-green-500/5' : 
                          status === 'error' ? 'border-red-500/30 bg-red-500/5' : 
                          status === 'not-verified' ? 'border-yellow-500/30 bg-yellow-500/5' : 
                          'border-white/10 hover:border-white/20'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{provider.name}</span>
                          {getStatusIcon(status)}
                        </div>
                        {provider.required && status !== 'connected' && (
                          <span className="text-xs text-red-400 mt-1">Required</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
