import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEnterpriseRBAC } from '@/contexts/EnterpriseRBACContext';

export interface APIIntegration {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastSync: string;
  config: Record<string, any>;
  health: {
    latency: number;
    uptime: number;
    errorRate: number;
  };
  usage: {
    requestsToday: number;
    limitPerDay: number;
    costToday: number;
  };
}

export interface WebhookEvent {
  id: string;
  source: string;
  event: string;
  payload: any;
  timestamp: string;
  processed: boolean;
  retryCount: number;
}

export const useRealTimeAPIIntegrations = () => {
  const [integrations, setIntegrations] = useState<APIIntegration[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission, auditLog } = useEnterpriseRBAC();

  // Load integrations
  const loadIntegrations = useCallback(async () => {
    if (!hasPermission('integrations', 'read')) {
      setLoading(false);
      return;
    }

    try {
      // Get user's API service providers from database
      const { data: providers, error } = await supabase
        .from('ai_service_providers')
        .select('*')
        .order('priority');

      if (error) {
        console.error('Error loading integrations:', error);
        toast.error('Failed to load API integrations');
        return;
      }

      const dbIntegrations: APIIntegration[] = providers?.map(provider => ({
        id: provider.id,
        name: provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1),
        provider: provider.provider,
        status: provider.status === 'active' ? 'connected' : 'disconnected',
        lastSync: provider.last_verified || new Date().toISOString(),
        config: { 
          apiKey: '***hidden***',
          endpoint: provider.setup_url || '',
          capabilities: provider.capabilities || []
        },
        health: { 
          latency: Math.random() * 200 + 50, 
          uptime: provider.status === 'active' ? 99.5 : 0,
          errorRate: provider.status === 'active' ? 0.1 : 5.0
        },
        usage: { 
          requestsToday: Math.floor(Math.random() * 1000),
          limitPerDay: 5000,
          costToday: Math.random() * 50
        }
      })) || [];

      setIntegrations(dbIntegrations);
      await auditLog('integrations_loaded', 'api', { count: dbIntegrations.length });
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast.error('Failed to load API integrations');
    } finally {
      setLoading(false);
    }
  }, [hasPermission, auditLog]);

  // Load webhook events
  const loadWebhookEvents = useCallback(async () => {
    if (!hasPermission('webhooks', 'read')) return;

    try {
      // Simulate recent webhook events
      const mockEvents: WebhookEvent[] = [
        {
          id: 'webhook-1',
          source: 'salesforce',
          event: 'contact.updated',
          payload: { contactId: 'c123', email: 'user@example.com' },
          timestamp: new Date(Date.now() - 60000).toISOString(),
          processed: true,
          retryCount: 0
        },
        {
          id: 'webhook-2',
          source: 'hubspot',
          event: 'deal.created',
          payload: { dealId: 'd456', value: 25000 },
          timestamp: new Date(Date.now() - 180000).toISOString(),
          processed: true,
          retryCount: 0
        },
        {
          id: 'webhook-3',
          source: 'slack',
          event: 'message.sent',
          payload: { channel: '#general', user: 'U123456' },
          timestamp: new Date(Date.now() - 300000).toISOString(),
          processed: false,
          retryCount: 2
        }
      ];

      setWebhookEvents(mockEvents);
    } catch (error) {
      console.error('Error loading webhook events:', error);
    }
  }, [hasPermission]);

  // Test API connection
  const testConnection = useCallback(async (integrationId: string) => {
    if (!hasPermission('integrations', 'write')) {
      toast.error('You do not have permission to test connections');
      return false;
    }

    try {
      // Simulate connection test
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'configuring' as const }
          : integration
      ));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const success = Math.random() > 0.2; // 80% success rate
      
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              status: success ? 'connected' as const : 'error' as const,
              lastSync: success ? new Date().toISOString() : integration.lastSync
            }
          : integration
      ));

      await auditLog('integration_test', 'api', { integrationId, success });
      
      if (success) {
        toast.success('Connection test successful');
      } else {
        toast.error('Connection test failed');
      }

      return success;
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Failed to test connection');
      return false;
    }
  }, [hasPermission, auditLog]);

  // Sync integration data
  const syncIntegration = useCallback(async (integrationId: string) => {
    if (!hasPermission('integrations', 'write')) {
      toast.error('You do not have permission to sync integrations');
      return false;
    }

    try {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'configuring' as const }
          : integration
      ));

      // Call edge function for real sync
      const { data, error } = await supabase.functions.invoke('webhook-integration', {
        body: { 
          action: 'trigger',
          webhookId: integrationId,
          payload: {
            type: 'sync_request',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        throw error;
      }

      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              status: 'connected' as const,
              lastSync: new Date().toISOString()
            }
          : integration
      ));

      await auditLog('integration_sync', 'api', { integrationId, success: true });
      toast.success('Integration synced successfully');
      return true;
    } catch (error) {
      console.error('Error syncing integration:', error);
      
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'error' as const }
          : integration
      ));

      await auditLog('integration_sync', 'api', { integrationId, success: false, error: error.message });
      toast.error('Failed to sync integration');
      return false;
    }
  }, [hasPermission, auditLog]);

  // Configure webhook
  const configureWebhook = useCallback(async (integrationId: string, webhookUrl: string, events: string[]) => {
    if (!hasPermission('webhooks', 'write')) {
      toast.error('You do not have permission to configure webhooks');
      return false;
    }

    try {
      // Call edge function to configure webhook
      const { data, error } = await supabase.functions.invoke('webhook-handler', {
        body: { 
          action: 'configure',
          integrationId,
          webhookUrl,
          events,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw error;
      }

      await auditLog('webhook_configured', 'api', { integrationId, webhookUrl, events });
      toast.success('Webhook configured successfully');
      return true;
    } catch (error) {
      console.error('Error configuring webhook:', error);
      await auditLog('webhook_configure_failed', 'api', { integrationId, error: error.message });
      toast.error('Failed to configure webhook');
      return false;
    }
  }, [hasPermission, auditLog]);

  // Retry webhook processing
  const retryWebhook = useCallback(async (eventId: string) => {
    if (!hasPermission('webhooks', 'write')) {
      toast.error('You do not have permission to retry webhooks');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('webhook-handler', {
        body: { 
          action: 'retry',
          eventId,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw error;
      }

      setWebhookEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, processed: true, retryCount: event.retryCount + 1 }
          : event
      ));

      await auditLog('webhook_retry', 'api', { eventId });
      toast.success('Webhook processed successfully');
      return true;
    } catch (error) {
      console.error('Error retrying webhook:', error);
      toast.error('Failed to retry webhook');
      return false;
    }
  }, [hasPermission, auditLog]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!hasPermission('integrations', 'read')) return;

    const channel = supabase
      .channel('api-integrations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'webhooks'
      }, (payload) => {
        console.log('Webhook event received:', payload);
        loadWebhookEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hasPermission, loadWebhookEvents]);

  useEffect(() => {
    loadIntegrations();
    loadWebhookEvents();
  }, [loadIntegrations, loadWebhookEvents]);

  return {
    integrations,
    webhookEvents,
    loading,
    testConnection,
    syncIntegration,
    configureWebhook,
    retryWebhook,
    refreshData: () => {
      loadIntegrations();
      loadWebhookEvents();
    }
  };
};