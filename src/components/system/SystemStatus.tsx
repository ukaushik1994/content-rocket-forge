
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'error' | 'warning' | 'checking';
  message?: string;
  lastChecked?: Date;
}

export function SystemStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Database', status: 'checking' },
    { name: 'OpenAI API', status: 'checking' },
    { name: 'SERP API', status: 'checking' },
    { name: 'Serpstack API', status: 'checking' },
  ]);
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();

  const checkServices = async () => {
    setIsChecking(true);
    const updatedServices: ServiceStatus[] = [];

    // Check Database
    try {
      await supabase.from('profiles').select('count').limit(1);
      updatedServices.push({
        name: 'Database',
        status: 'healthy',
        message: 'Connected successfully',
        lastChecked: new Date()
      });
    } catch (error) {
      updatedServices.push({
        name: 'Database',
        status: 'error',
        message: 'Connection failed',
        lastChecked: new Date()
      });
    }

    // Check API Keys and Services
    if (user) {
      const apiServices = [
        { name: 'OpenAI API', service: 'openai' },
        { name: 'SERP API', service: 'serp' },
        { name: 'Serpstack API', service: 'serpstack' }
      ];

      for (const { name, service } of apiServices) {
        try {
          const { data: apiKeys } = await supabase
            .from('api_keys')
            .select('encrypted_key')
            .eq('user_id', user.id)
            .eq('service', service)
            .eq('is_active', true);

          if (!apiKeys || apiKeys.length === 0) {
            updatedServices.push({
              name,
              status: 'warning',
              message: 'API key not configured',
              lastChecked: new Date()
            });
          } else {
            // Test the API
            try {
              const { data, error } = await supabase.functions.invoke('api-proxy', {
                body: JSON.stringify({
                  service: service,
                  endpoint: 'test',
                  params: {},
                  apiKey: apiKeys[0].encrypted_key
                })
              });

              if (error || data?.error) {
                updatedServices.push({
                  name,
                  status: 'error',
                  message: data?.error || 'API test failed',
                  lastChecked: new Date()
                });
              } else {
                updatedServices.push({
                  name,
                  status: 'healthy',
                  message: 'API working correctly',
                  lastChecked: new Date()
                });
              }
            } catch (testError) {
              updatedServices.push({
                name,
                status: 'error',
                message: 'API test failed',
                lastChecked: new Date()
              });
            }
          }
        } catch (error) {
          updatedServices.push({
            name,
            status: 'error',
            message: 'Unable to check status',
            lastChecked: new Date()
          });
        }
      }
    } else {
      // User not logged in
      ['OpenAI API', 'SERP API', 'Serpstack API'].forEach(name => {
        updatedServices.push({
          name,
          status: 'warning',
          message: 'Login required to check',
          lastChecked: new Date()
        });
      });
    }

    setServices(updatedServices);
    setIsChecking(false);
  };

  useEffect(() => {
    checkServices();
  }, [user]);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    const variants = {
      healthy: 'default',
      error: 'destructive',
      warning: 'secondary',
      checking: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">System Status</CardTitle>
        <Button
          onClick={checkServices}
          disabled={isChecking}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(service.status)}
                <div>
                  <p className="font-medium">{service.name}</p>
                  {service.message && (
                    <p className="text-sm text-muted-foreground">
                      {service.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(service.status)}
                {service.lastChecked && (
                  <p className="text-xs text-muted-foreground">
                    {service.lastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
