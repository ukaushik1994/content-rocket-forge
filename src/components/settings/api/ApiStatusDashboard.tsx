import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, XCircle, RefreshCw, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { ApiProvider } from './types';

interface ApiStatusDashboardProps {
  providers: ApiProvider[];
  selectedProviders: string[];
  onRefreshAll: () => void;
  onQuickSetup: () => void;
}

export const ApiStatusDashboard = ({ 
  providers, 
  selectedProviders, 
  onRefreshAll, 
  onQuickSetup 
}: ApiStatusDashboardProps) => {
  const visibleProviders = providers.filter(p => p.required || selectedProviders.includes(p.id));
  
  // Simulate status - in real implementation, this would come from actual API key testing
  const getProviderStatus = (provider: ApiProvider) => {
    const random = Math.random();
    if (provider.required) {
      return random > 0.3 ? 'connected' : random > 0.1 ? 'warning' : 'error';
    }
    return random > 0.5 ? 'connected' : random > 0.2 ? 'warning' : 'error';
  };

  const statusCounts = visibleProviders.reduce((acc, provider) => {
    const status = getProviderStatus(provider);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-red-500 bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
    >
      <Card className="border border-green-500/20 bg-green-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{statusCounts.connected || 0}</p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-500/10">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{statusCounts.warning || 0}</p>
              <p className="text-sm text-muted-foreground">Needs Attention</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-red-500/20 bg-red-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{statusCounts.error || 0}</p>
              <p className="text-sm text-muted-foreground">Not Working</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-neon-purple/20 bg-neon-purple/5">
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <Button 
              onClick={onQuickSetup}
              variant="outline" 
              size="sm" 
              className="w-full border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10"
            >
              <Settings className="h-4 w-4 mr-2" />
              Quick Setup
            </Button>
            <Button 
              onClick={onRefreshAll}
              variant="ghost" 
              size="sm" 
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};