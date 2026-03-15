import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Zap, 
  Users, 
  Mail, 
  BarChart3, 
  Calendar, 
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'automation' | 'crm' | 'email' | 'analytics' | 'social' | 'productivity';
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error';
  isEnabled: boolean;
  features: string[];
  setupUrl?: string;
  webhookUrl?: string;
  lastSync?: string;
  settings?: Record<string, any>;
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows with 5000+ apps',
    category: 'automation',
    icon: <Zap className="h-5 w-5" />,
    status: 'disconnected',
    isEnabled: false,
    features: ['Workflow Automation', 'Trigger Actions', 'Data Sync'],
    setupUrl: 'https://zapier.com/apps/webhook/integrations'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM and marketing automation',
    category: 'crm',
    icon: <Users className="h-5 w-5" />,
    status: 'connected',
    isEnabled: true,
    features: ['Contact Management', 'Deal Tracking', 'Email Campaigns'],
    lastSync: '2 minutes ago'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing platform',
    category: 'email',
    icon: <Mail className="h-5 w-5" />,
    status: 'connected',
    isEnabled: true,
    features: ['Email Lists', 'Campaign Management', 'Analytics'],
    lastSync: '5 minutes ago'
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Web analytics and insights',
    category: 'analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    status: 'connected',
    isEnabled: true,
    features: ['Traffic Analysis', 'Conversion Tracking', 'Custom Reports'],
    lastSync: '1 hour ago'
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Meeting scheduling made easy',
    category: 'productivity',
    icon: <Calendar className="h-5 w-5" />,
    status: 'disconnected',
    isEnabled: false,
    features: ['Meeting Scheduling', 'Calendar Sync', 'Automated Reminders']
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'All-in-one workspace',
    category: 'productivity',
    icon: <FileText className="h-5 w-5" />,
    status: 'error',
    isEnabled: false,
    features: ['Document Management', 'Database Sync', 'Content Publishing']
  }
];

export const ThirdPartyIntegrations: React.FC = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>(AVAILABLE_INTEGRATIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'All Integrations', count: integrations.length },
    { id: 'automation', name: 'Automation', count: integrations.filter(i => i.category === 'automation').length },
    { id: 'crm', name: 'CRM', count: integrations.filter(i => i.category === 'crm').length },
    { id: 'email', name: 'Email', count: integrations.filter(i => i.category === 'email').length },
    { id: 'analytics', name: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length },
    { id: 'productivity', name: 'Productivity', count: integrations.filter(i => i.category === 'productivity').length }
  ];

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  const connectedCount = integrations.filter(i => i.status === 'connected' && i.isEnabled).length;

  const toggleIntegration = async (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, isEnabled: !integration.isEnabled }
        : integration
    ));

    const integration = integrations.find(i => i.id === id);
    toast({
      title: integration?.isEnabled ? 'Integration Disabled' : 'Integration Enabled',
      description: `${integration?.name} has been ${integration?.isEnabled ? 'disabled' : 'enabled'}`,
    });
  };

  const connectIntegration = async (id: string) => {
    setIsConnecting(id);
    
    // Simulate connection process
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === id 
          ? { 
              ...integration, 
              status: 'connected', 
              isEnabled: true,
              lastSync: 'Just now'
            }
          : integration
      ));
      
      const integration = integrations.find(i => i.id === id);
      toast({
        title: 'Integration Connected',
        description: `Successfully connected to ${integration?.name}`,
      });
      
      setIsConnecting(null);
    }, 2000);
  };

  const disconnectIntegration = async (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, status: 'disconnected', isEnabled: false }
        : integration
    ));

    const integration = integrations.find(i => i.id === id);
    toast({
      title: 'Integration Disconnected',
      description: `Disconnected from ${integration?.name}`,
      variant: 'destructive'
    });
  };

  const syncIntegration = async (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, lastSync: 'Just now' }
        : integration
    ));

    toast({
      title: 'Sync Complete',
      description: 'Data has been synchronized successfully',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleZapierWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    try {
      // Fetch most recent content item for realistic webhook test
      let testData: any = {
        note: 'No content available - create content first for realistic tests',
        content_type: 'test',
        title: 'Webhook Test',
        word_count: 0,
        seo_score: 0
      };
      
      if (user?.id) {
        const { data: recentContent } = await supabase
          .from('content_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (recentContent) {
          testData = {
            content_type: recentContent.content_type || 'blog_post',
            title: recentContent.title,
            word_count: recentContent.content?.split(/\s+/).length || 0,
            seo_score: recentContent.seo_score || 0
          };
        }
      }
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          event_type: 'ai_content_generated',
          data: testData
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
      }

      toast({
        title: "Webhook Triggered",
        description: "The Zapier webhook was triggered successfully. Check your Zap's history.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the Zapier webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Third-Party Integrations</h2>
          <p className="text-muted-foreground">
            Connect with your favorite tools and automate workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {connectedCount} Connected
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Integration</DialogTitle>
                <DialogDescription>
                  Set up a custom webhook or API integration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input 
                    id="webhook-url"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                </div>
                <Button onClick={handleZapierWebhook} className="w-full">
                  Test Webhook
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name}
              <Badge variant="secondary" className="ml-1 text-xs">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map(integration => (
            <Card key={integration.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {integration.icon}
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    <Switch
                      checked={integration.isEnabled}
                      onCheckedChange={() => toggleIntegration(integration.id)}
                      disabled={integration.status !== 'connected'}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.map(feature => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {integration.lastSync && (
                  <div className="text-sm text-muted-foreground">
                    Last sync: {integration.lastSync}
                  </div>
                )}

                <div className="flex gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => syncIntegration(integration.id)}
                        className="flex-1"
                      >
                        Sync Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => disconnectIntegration(integration.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => connectIntegration(integration.id)}
                      disabled={isConnecting === integration.id}
                      className="flex-1"
                    >
                      {isConnecting === integration.id ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                  
                  {integration.setupUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={integration.setupUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>

      {/* Quick Actions for Popular Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex-col">
              <Zap className="h-5 w-5 mb-1" />
              <span className="text-xs">Trigger Zapier</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs">Sync CRM</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Mail className="h-5 w-5 mb-1" />
              <span className="text-xs">Send Newsletter</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <BarChart3 className="h-5 w-5 mb-1" />
              <span className="text-xs">Update Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};