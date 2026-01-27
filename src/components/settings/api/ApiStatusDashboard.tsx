import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, XCircle, RefreshCw, Settings, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ApiProvider } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useCallback } from 'react';

interface ApiStatusDashboardProps {
  providers: ApiProvider[];
  selectedProviders: string[];
  onRefreshAll: () => void;
  onQuickSetup: () => void;
}

type ProviderStatus = 'connected' | 'warning' | 'error' | 'unknown' | 'loading';

export const ApiStatusDashboard = ({ 
  providers, 
  selectedProviders, 
  onRefreshAll, 
  onQuickSetup 
}: ApiStatusDashboardProps) => {
  const { user } = useAuth();
  const [providerStatuses, setProviderStatuses] = useState<Record<string, ProviderStatus>>({});
  const [isLoading, setIsLoading] = useState(true);

  const visibleProviders = providers.filter(p => p.required || selectedProviders.includes(p.id));

  // Fetch real provider status from database
  const getProviderStatus = useCallback(async (providerId: string): Promise<ProviderStatus> => {
    if (!user?.id) return 'unknown';

    try {
      const { data, error } = await supabase
        .from('ai_service_providers')
        .select('status, api_key, last_verified')
        .eq('provider', providerId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error(`Error checking provider ${providerId}:`, error);
        return 'unknown';
      }

      if (!data) return 'error'; // No configuration found
      if (!data.api_key) return 'error'; // No API key
      if (data.status === 'active') return 'connected';
      if (data.status === 'error') return 'error';
      
      // Check if last verification is stale (> 1 hour)
      if (data.last_verified) {
        const lastVerified = new Date(data.last_verified);
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (lastVerified < hourAgo) {
          return 'warning'; // Needs re-validation
        }
      }
      
      return data.status === 'active' ? 'connected' : 'warning';
    } catch (error) {
      console.error(`Error checking provider ${providerId}:`, error);
      return 'unknown';
    }
  }, [user?.id]);

  // Check all provider statuses on mount
  useEffect(() => {
    const checkAllStatuses = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Initialize all as loading
      const initialStatuses: Record<string, ProviderStatus> = {};
      visibleProviders.forEach(p => {
        initialStatuses[p.id] = 'loading';
      });
      setProviderStatuses(initialStatuses);

      // Check each provider in parallel
      const statusPromises = visibleProviders.map(async (provider) => {
        const status = await getProviderStatus(provider.id);
        return { id: provider.id, status };
      });

      const results = await Promise.all(statusPromises);
      
      const newStatuses: Record<string, ProviderStatus> = {};
      results.forEach(({ id, status }) => {
        newStatuses[id] = status;
      });
      
      setProviderStatuses(newStatuses);
      setIsLoading(false);
    };

    checkAllStatuses();
  }, [user?.id, visibleProviders.length, getProviderStatus]);

  // Calculate status counts from real data
  const statusCounts = visibleProviders.reduce((acc, provider) => {
    const status = providerStatuses[provider.id] || 'unknown';
    if (status === 'connected') acc.connected++;
    else if (status === 'warning' || status === 'loading') acc.warning++;
    else acc.error++;
    return acc;
  }, { connected: 0, warning: 0, error: 0 });

  const handleRefresh = () => {
    // Re-check all statuses
    setIsLoading(true);
    onRefreshAll();
    // Trigger re-fetch by resetting statuses
    setProviderStatuses({});
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
              <p className="text-2xl font-bold text-green-500">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : statusCounts.connected}
              </p>
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
              <p className="text-2xl font-bold text-yellow-500">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : statusCounts.warning}
              </p>
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
              <p className="text-2xl font-bold text-red-500">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : statusCounts.error}
              </p>
              <p className="text-sm text-muted-foreground">Not Configured</p>
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
              onClick={handleRefresh}
              variant="ghost" 
              size="sm" 
              className="w-full text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
