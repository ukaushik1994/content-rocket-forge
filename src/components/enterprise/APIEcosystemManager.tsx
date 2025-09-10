import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Key,
  Globe,
  Zap,
  Shield,
  Activity,
  Code,
  Webhook,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  rateLimit: number;
  usage: number;
  maxUsage: number;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'inactive' | 'expired';
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive';
  lastTriggered: string;
  successCount: number;
  failureCount: number;
}

interface ThirdPartyAPI {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'connected' | 'available' | 'error';
  apiKey?: string;
  rateLimit: number;
  usage: number;
  documentation: string;
  pricing: string;
}

interface RateLimitSettings {
  enabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

const MOCK_API_KEYS: APIKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'ak_live_1234567890abcdef',
    permissions: ['content:read', 'content:write', 'analytics:read'],
    rateLimit: 1000,
    usage: 750,
    maxUsage: 1000,
    createdAt: '2024-01-15',
    lastUsed: '2024-01-20',
    status: 'active'
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'ak_test_0987654321fedcba',
    permissions: ['content:read'],
    rateLimit: 100,
    usage: 25,
    maxUsage: 100,
    createdAt: '2024-01-18',
    lastUsed: '2024-01-19',
    status: 'active'
  }
];

const MOCK_WEBHOOKS: WebhookConfig[] = [
  {
    id: '1',
    name: 'Content Created Webhook',
    url: 'https://api.company.com/webhooks/content',
    events: ['content.created', 'content.published'],
    secret: 'whsec_1234567890',
    status: 'active',
    lastTriggered: '2024-01-20T10:30:00Z',
    successCount: 98,
    failureCount: 2
  },
  {
    id: '2',
    name: 'Team Updates Webhook',
    url: 'https://slack.com/webhooks/team-updates',
    events: ['team.member_added', 'team.member_removed'],
    secret: 'whsec_0987654321',
    status: 'active',
    lastTriggered: '2024-01-19T15:45:00Z',
    successCount: 45,
    failureCount: 0
  }
];

const MOCK_THIRD_PARTY_APIS: ThirdPartyAPI[] = [
  {
    id: '1',
    name: 'Google Analytics',
    category: 'Analytics',
    description: 'Web analytics and reporting platform',
    status: 'connected',
    rateLimit: 10000,
    usage: 2500,
    documentation: 'https://developers.google.com/analytics',
    pricing: 'Free tier available'
  },
  {
    id: '2',
    name: 'Stripe',
    category: 'Payments',
    description: 'Payment processing and billing',
    status: 'available',
    rateLimit: 100,
    usage: 0,
    documentation: 'https://stripe.com/docs',
    pricing: 'Transaction fees apply'
  },
  {
    id: '3',
    name: 'Zapier',
    category: 'Automation',
    description: 'Workflow automation platform',
    status: 'connected',
    rateLimit: 1000,
    usage: 150,
    documentation: 'https://zapier.com/developer',
    pricing: 'Based on plan'
  }
];

const MOCK_RATE_LIMITS: RateLimitSettings = {
  enabled: true,
  requestsPerMinute: 60,
  requestsPerHour: 1000,
  requestsPerDay: 10000,
  burstLimit: 100
};

export const APIEcosystemManager: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKey[]>(MOCK_API_KEYS);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(MOCK_WEBHOOKS);
  const [thirdPartyAPIs, setThirdPartyAPIs] = useState<ThirdPartyAPI[]>(MOCK_THIRD_PARTY_APIS);
  const [rateLimits, setRateLimits] = useState<RateLimitSettings>(MOCK_RATE_LIMITS);
  const [showKeyValues, setShowKeyValues] = useState<{ [key: string]: boolean }>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const generateAPIKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please provide a name for the API key');
      return;
    }

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `ak_live_${Math.random().toString(36).substring(2, 15)}`,
      permissions: ['content:read'],
      rateLimit: 1000,
      usage: 0,
      maxUsage: 1000,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      status: 'active'
    };

    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName('');
    toast.success('API key generated successfully');
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValues(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const deleteAPIKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
    toast.success('API key deleted');
  };

  const createWebhook = () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) {
      toast.error('Please provide name and URL for the webhook');
      return;
    }

    const newWebhook: WebhookConfig = {
      id: Date.now().toString(),
      name: newWebhookName,
      url: newWebhookUrl,
      events: ['content.created'],
      secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
      status: 'active',
      lastTriggered: 'Never',
      successCount: 0,
      failureCount: 0
    };

    setWebhooks(prev => [...prev, newWebhook]);
    setNewWebhookName('');
    setNewWebhookUrl('');
    toast.success('Webhook created successfully');
  };

  const testWebhook = async (webhook: WebhookConfig) => {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhook.secret
        },
        body: JSON.stringify({
          event: 'webhook.test',
          timestamp: new Date().toISOString(),
          data: { message: 'This is a test webhook event' }
        })
      });

      if (response.ok) {
        toast.success('Webhook test successful');
        setWebhooks(prev => prev.map(w => 
          w.id === webhook.id 
            ? { ...w, successCount: w.successCount + 1, lastTriggered: new Date().toISOString() }
            : w
        ));
      } else {
        toast.error('Webhook test failed');
        setWebhooks(prev => prev.map(w => 
          w.id === webhook.id 
            ? { ...w, failureCount: w.failureCount + 1 }
            : w
        ));
      }
    } catch (error) {
      toast.error('Webhook test failed');
      setWebhooks(prev => prev.map(w => 
        w.id === webhook.id 
          ? { ...w, failureCount: w.failureCount + 1 }
          : w
      ));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            API Ecosystem Management
          </CardTitle>
          <CardDescription>
            Manage API keys, webhooks, third-party integrations, and rate limiting for your AI platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="api-keys" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
            </TabsList>

            <TabsContent value="api-keys" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New API Key</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="key-name">API Key Name</Label>
                      <Input
                        id="key-name"
                        placeholder="Production API Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={generateAPIKey}>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Key
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Keys ({apiKeys.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            <h4 className="font-medium">{apiKey.name}</h4>
                            {getStatusIcon(apiKey.status)}
                            <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                              {apiKey.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                            >
                              {showKeyValues[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(apiKey.key)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteAPIKey(apiKey.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="font-mono text-sm p-2 bg-gray-50 rounded border">
                            {showKeyValues[apiKey.id] ? apiKey.key : '••••••••••••••••••••'}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Created:</span>
                              <p className="font-medium">{apiKey.createdAt}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Last Used:</span>
                              <p className="font-medium">{apiKey.lastUsed}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Rate Limit:</span>
                              <p className="font-medium">{apiKey.rateLimit}/min</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Permissions:</span>
                              <p className="font-medium">{apiKey.permissions.length} granted</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Usage This Month</span>
                              <span>{apiKey.usage}/{apiKey.maxUsage}</span>
                            </div>
                            <Progress value={(apiKey.usage / apiKey.maxUsage) * 100} className="w-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New Webhook</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="webhook-name">Webhook Name</Label>
                      <Input
                        id="webhook-name"
                        placeholder="Content Updates Webhook"
                        value={newWebhookName}
                        onChange={(e) => setNewWebhookName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="webhook-url">Endpoint URL</Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://api.example.com/webhooks"
                        value={newWebhookUrl}
                        onChange={(e) => setNewWebhookUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={createWebhook}>
                    <Webhook className="h-4 w-4 mr-2" />
                    Create Webhook
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Webhooks ({webhooks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {webhooks.map((webhook) => (
                      <div key={webhook.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Webhook className="h-4 w-4" />
                            <h4 className="font-medium">{webhook.name}</h4>
                            {getStatusIcon(webhook.status)}
                            <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                              {webhook.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testWebhook(webhook)}
                            >
                              <Zap className="h-4 w-4 mr-1" />
                              Test
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-sm">
                            <span className="text-muted-foreground">URL:</span>
                            <p className="font-mono bg-gray-50 p-2 rounded mt-1">{webhook.url}</p>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Events:</span>
                              <p className="font-medium">{webhook.events.length} subscribed</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Last Triggered:</span>
                              <p className="font-medium">
                                {webhook.lastTriggered === 'Never' ? 'Never' : new Date(webhook.lastTriggered).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Success Rate:</span>
                              <p className="font-medium text-green-600">
                                {webhook.successCount + webhook.failureCount > 0 
                                  ? Math.round((webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100)
                                  : 0}%
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Calls:</span>
                              <p className="font-medium">{webhook.successCount + webhook.failureCount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Third-Party API Integrations</CardTitle>
                  <CardDescription>
                    Connect with external services to enhance your AI platform capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {thirdPartyAPIs.map((api) => (
                      <Card key={api.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            <h4 className="font-medium">{api.name}</h4>
                            {getStatusIcon(api.status)}
                          </div>
                          <Badge 
                            variant={
                              api.status === 'connected' ? 'default' : 
                              api.status === 'available' ? 'secondary' : 'destructive'
                            }
                          >
                            {api.status}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-muted-foreground">Category:</span>
                            <p className="text-sm font-medium">{api.category}</p>
                          </div>

                          <p className="text-sm text-muted-foreground">{api.description}</p>

                          {api.status === 'connected' && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>API Usage</span>
                                <span>{api.usage}/{api.rateLimit}</span>
                              </div>
                              <Progress value={(api.usage / api.rateLimit) * 100} className="w-full" />
                            </div>
                          )}

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Pricing:</span>
                            <span>{api.pricing}</span>
                          </div>

                          <div className="flex gap-2">
                            {api.status === 'available' ? (
                              <Button size="sm" className="flex-1">
                                Connect
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="flex-1">
                                Configure
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Globe className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rate-limits" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Rate Limiting Configuration
                  </CardTitle>
                  <CardDescription>
                    Control API usage limits to prevent abuse and ensure fair resource allocation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">Enable Rate Limiting</h4>
                      <p className="text-sm text-muted-foreground">
                        Apply usage limits to all API keys and integrations
                      </p>
                    </div>
                    <Switch
                      checked={rateLimits.enabled}
                      onCheckedChange={(checked) => setRateLimits(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>

                  {rateLimits.enabled && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="per-minute">Requests per Minute</Label>
                          <Input
                            id="per-minute"
                            type="number"
                            value={rateLimits.requestsPerMinute}
                            onChange={(e) => setRateLimits(prev => ({ 
                              ...prev, 
                              requestsPerMinute: parseInt(e.target.value) 
                            }))}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="per-hour">Requests per Hour</Label>
                          <Input
                            id="per-hour"
                            type="number"
                            value={rateLimits.requestsPerHour}
                            onChange={(e) => setRateLimits(prev => ({ 
                              ...prev, 
                              requestsPerHour: parseInt(e.target.value) 
                            }))}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="per-day">Requests per Day</Label>
                          <Input
                            id="per-day"
                            type="number"
                            value={rateLimits.requestsPerDay}
                            onChange={(e) => setRateLimits(prev => ({ 
                              ...prev, 
                              requestsPerDay: parseInt(e.target.value) 
                            }))}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="burst-limit">Burst Limit</Label>
                          <Input
                            id="burst-limit"
                            type="number"
                            value={rateLimits.burstLimit}
                            onChange={(e) => setRateLimits(prev => ({ 
                              ...prev, 
                              burstLimit: parseInt(e.target.value) 
                            }))}
                          />
                        </div>
                      </div>

                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="pt-4">
                          <h4 className="font-medium text-yellow-900 mb-2">Rate Limiting Guidelines</h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Set conservative limits initially and increase based on usage patterns</li>
                            <li>• Burst limits allow temporary spikes above the per-minute rate</li>
                            <li>• Monitor API usage metrics to optimize rate limits</li>
                            <li>• Different API keys can have custom rate limits if needed</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <div className="flex gap-2">
                        <Button>Save Rate Limits</Button>
                        <Button variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Usage Analytics
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};