import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Slack, 
  Zap, 
  Mail, 
  FileText, 
  Settings, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Webhook,
  Clock,
  Key,
  User
} from 'lucide-react';
import { marketingIntegrationHooks } from '@/services/marketingIntegrationHooks';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmptyDataState } from '@/components/ui/empty-state';

type ErrorType = 'no-auth' | 'no-api-keys' | 'api-error' | 'database-error' | 'no-data';

export const MarketingIntegrationsPanel = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIntegrations, setActiveIntegrations] = useState(new Set());
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [stats, setStats] = useState({ eventsToday: 0, successRate: 0 });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorType(null);

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Authentication required to view marketing integrations');
        setErrorType('no-auth');
        return;
      }

      const data = await marketingIntegrationHooks.getIntegrations();
      
      if (!data || data.length === 0) {
        setError('No integration data available');
        setErrorType('no-data');
        return;
      }

      setIntegrations(data);
      
      // Set active integrations
      const active = new Set(data.filter(i => i.enabled).map(i => i.id));
      setActiveIntegrations(active);

      // Load real stats
      const statsData = await marketingIntegrationHooks.getIntegrationStats();
      setStats(statsData || { eventsToday: 0, successRate: 0 });
    } catch (error) {
      console.error('Error loading integrations:', error);
      setError('Failed to load marketing integrations');
      setErrorType('api-error');
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationToggle = async (integrationId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await marketingIntegrationHooks.registerIntegration(integrationId, {});
        setActiveIntegrations(prev => new Set([...prev, integrationId]));
        toast({
          title: "Integration Enabled",
          description: "Successfully enabled marketing integration",
        });
      } else {
        await marketingIntegrationHooks.removeIntegration(integrationId);
        setActiveIntegrations(prev => {
          const next = new Set(prev);
          next.delete(integrationId);
          return next;
        });
        toast({
          title: "Integration Disabled",
          description: "Marketing integration has been disabled",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update integration status",
        variant: "destructive",
      });
    }
  };

  const availableIntegrations = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send SERP alerts and reports to Slack channels',
      icon: Slack,
      category: 'Communication',
      status: 'available',
      features: ['Real-time alerts', 'Weekly reports', 'Keyword notifications']
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect SERP data to 5000+ apps via Zapier automation',
      icon: Zap,
      category: 'Automation',
      status: 'available',
      features: ['Workflow automation', 'Data sync', 'Custom triggers']
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Sync SERP insights with HubSpot CRM and marketing tools',
      icon: Mail,
      category: 'CRM',
      status: 'available',
      features: ['Lead scoring', 'Content optimization', 'Campaign insights']
    },
    {
      id: 'google_sheets',
      name: 'Google Sheets',
      description: 'Export SERP data automatically to Google Sheets',
      icon: FileText,
      category: 'Data Export',
      status: 'available',
      features: ['Auto-export', 'Real-time sync', 'Custom formatting']
    },
    {
      id: 'webhooks',
      name: 'Custom Webhooks',
      description: 'Send SERP data to custom endpoints and APIs',
      icon: Webhook,
      category: 'Developer',
      status: 'available',
      features: ['Custom endpoints', 'Real-time data', 'Flexible formatting']
    }
  ];

  const IntegrationCard = ({ integration }) => {
    const Icon = integration.icon;
    const isActive = activeIntegrations.has(integration.id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="h-full hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {integration.category}
                  </Badge>
                </div>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(enabled) => handleIntegrationToggle(integration.id, enabled)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="text-sm">
              {integration.description}
            </CardDescription>
            
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Features</Label>
              <div className="flex flex-wrap gap-1">
                {integration.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                {isActive ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Inactive</span>
                  </>
                )}
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configure {integration.name} Integration</DialogTitle>
                    <DialogDescription>
                      Set up your {integration.name.toLowerCase()} integration settings
                    </DialogDescription>
                  </DialogHeader>
                  <IntegrationConfigForm integration={integration} />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const IntegrationConfigForm = ({ integration }) => {
    const [config, setConfig] = useState<any>({});

    const handleSave = async () => {
      try {
        await marketingIntegrationHooks.registerIntegration(integration.id, config);
        toast({
          title: "Configuration Saved",
          description: `${integration.name} integration updated successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save integration configuration",
          variant: "destructive",
        });
      }
    };

    const renderConfigFields = () => {
      switch (integration.id) {
        case 'slack':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input 
                  placeholder="https://hooks.slack.com/services/..." 
                  value={config.webhookUrl || ''}
                  onChange={(e) => setConfig({...config, webhookUrl: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Default Channel</Label>
                <Input 
                  placeholder="#serp-alerts" 
                  value={config.channel || ''}
                  onChange={(e) => setConfig({...config, channel: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Alert Types</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alert types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All alerts</SelectItem>
                    <SelectItem value="critical">Critical only</SelectItem>
                    <SelectItem value="custom">Custom filter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        
        case 'webhooks':
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input 
                  placeholder="https://your-api.com/webhook" 
                  value={config.endpointUrl || ''}
                  onChange={(e) => setConfig({...config, endpointUrl: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Authentication Token</Label>
                <Input 
                  type="password"
                  placeholder="Bearer token or API key" 
                  value={config.authToken || ''}
                  onChange={(e) => setConfig({...config, authToken: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Custom Headers (JSON)</Label>
                <Textarea 
                  placeholder='{"Content-Type": "application/json"}' 
                  value={config.headers || ''}
                  onChange={(e) => setConfig({...config, headers: e.target.value})}
                />
              </div>
            </div>
          );
        
        default:
          return (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input 
                  type="password"
                  placeholder="Enter your API key" 
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Configuration</Label>
                <Textarea 
                  placeholder="Additional configuration (JSON)" 
                  value={config.additional || ''}
                  onChange={(e) => setConfig({...config, additional: e.target.value})}
                />
              </div>
            </div>
          );
      }
    };

    return (
      <div className="space-y-6">
        {renderConfigFields()}
        
        <div className="flex justify-between">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Documentation
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <Zap className="h-8 w-8" />
        </div>
      </div>
    );
  }

  // Handle error states
  if (error) {
    const getErrorAction = () => {
      switch (errorType) {
        case 'no-auth':
          return {
            label: 'Sign In',
            onClick: () => window.location.href = '/auth'
          };
        case 'api-error':
        case 'database-error':
          return {
            label: 'Retry',
            onClick: loadIntegrations
          };
        default:
          return {
            label: 'Refresh',
            onClick: loadIntegrations
          };
      }
    };

    const action = getErrorAction();

    return (
      <EmptyDataState
        icon={errorType === 'no-auth' ? User : AlertCircle}
        title="Marketing Integrations Unavailable"
        description={error}
        action={action}
      />
    );
  }
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold">Marketing Integrations</h2>
          <p className="text-muted-foreground">Connect SERP intelligence to your marketing stack</p>
        </div>
        <Badge variant="secondary">
          {activeIntegrations.size} Active
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{activeIntegrations.size}</p>
                <p className="text-xs text-muted-foreground">Active Integrations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.eventsToday || 0}</p>
                <p className="text-xs text-muted-foreground">Events Sent Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.successRate || 0}%</p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Management */}
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Integrations</TabsTrigger>
          <TabsTrigger value="active">Active Integrations</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableIntegrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="space-y-4">
            {activeIntegrations.size === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active integrations</p>
                  <p className="text-sm text-muted-foreground">Enable integrations to start syncing SERP data</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableIntegrations
                  .filter(integration => activeIntegrations.has(integration.id))
                  .map((integration) => (
                    <IntegrationCard key={integration.id} integration={integration} />
                  ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Integration Activity</CardTitle>
              <CardDescription>Recent webhook deliveries and API calls</CardDescription>
            </CardHeader>
            <CardContent>
              {integrations.length > 0 ? (
                <div className="space-y-4">
                  {integrations.slice(0, 4).map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <div>
                          <p className="text-sm font-medium">{integration.name}</p>
                          <p className="text-xs text-muted-foreground">Recent activity</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Active</p>
                        <Badge variant="secondary" className="text-xs">success</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No activity logs available</p>
                  <p className="text-xs">Enable integrations to see activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};