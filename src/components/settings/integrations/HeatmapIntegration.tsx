import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  MousePointer, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Save,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Provider = 'clarity' | 'hotjar';

interface HeatmapConfig {
  projectId: string;
  apiToken: string;
}

export const HeatmapIntegration: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [provider, setProvider] = useState<Provider>('clarity');
  const [config, setConfig] = useState<HeatmapConfig>({ projectId: '', apiToken: '' });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      loadExistingConfig();
    }
  }, [user, provider]);

  const loadExistingConfig = async () => {
    if (!user) return;

    const service = provider === 'clarity' ? 'microsoft-clarity' : 'hotjar';
    
    const { data } = await supabase
      .from('api_keys_metadata')
      .select('service, is_active')
      .eq('user_id', user.id)
      .eq('service', service)
      .maybeSingle();

    setIsConnected(!!data?.is_active);
  };

  const handleSave = async () => {
    if (!user || !config.projectId || !config.apiToken) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both Project ID and API Token',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const service = provider === 'clarity' ? 'microsoft-clarity' : 'hotjar';
      
      // Save via secure-api-key edge function
      const { error } = await supabase.functions.invoke('secure-api-key', {
        body: {
          action: 'save',
          service,
          apiKey: JSON.stringify({
            projectId: config.projectId,
            apiToken: config.apiToken
          })
        }
      });

      if (error) throw error;

      setIsConnected(true);
      toast({
        title: 'Configuration Saved',
        description: `${provider === 'clarity' ? 'Microsoft Clarity' : 'Hotjar'} has been configured successfully`
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!user) return;

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('clarity-fetch', {
        body: {
          url: 'https://example.com',
          userId: user.id,
          provider
        }
      });

      if (error) throw error;

      if (data?.isMockData) {
        toast({
          title: 'Configuration Required',
          description: 'Please enter valid credentials to fetch real data',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Connection Successful',
          description: 'Successfully connected to heatmap provider'
        });
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: 'Test Failed',
        description: 'Could not connect to the heatmap provider',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MousePointer className="h-5 w-5 text-primary" />
          Heatmap Integration
        </CardTitle>
        <CardDescription>
          Connect Microsoft Clarity or Hotjar to track user behavior and engagement
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={provider} onValueChange={(v) => setProvider(v as Provider)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clarity" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Microsoft Clarity
              {provider === 'clarity' && isConnected && (
                <Badge variant="outline" className="ml-1 bg-green-500/20 text-green-400">
                  <CheckCircle className="h-3 w-3" />
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="hotjar" className="flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Hotjar
              {provider === 'hotjar' && isConnected && (
                <Badge variant="outline" className="ml-1 bg-green-500/20 text-green-400">
                  <CheckCircle className="h-3 w-3" />
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clarity" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h4 className="font-medium text-blue-400 mb-2">Microsoft Clarity (Free)</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Free behavioral analytics tool that captures heatmaps, session recordings, and insights.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-400"
                  onClick={() => window.open('https://clarity.microsoft.com/', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Sign Up Free
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-400"
                  onClick={() => window.open('https://docs.microsoft.com/en-us/clarity/', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Documentation
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="clarity-project-id">Clarity Project ID</Label>
                <Input
                  id="clarity-project-id"
                  placeholder="e.g., abc123xyz"
                  value={config.projectId}
                  onChange={(e) => setConfig(prev => ({ ...prev, projectId: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Found in Clarity Dashboard → Settings → Overview
                </p>
              </div>

              <div>
                <Label htmlFor="clarity-api-token">API Token (Optional)</Label>
                <Input
                  id="clarity-api-token"
                  type="password"
                  placeholder="For API access (if available)"
                  value={config.apiToken}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiToken: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Note: Clarity API access may require enterprise plan
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hotjar" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <h4 className="font-medium text-orange-400 mb-2">Hotjar (Paid)</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Industry-leading heatmap and behavior analytics with comprehensive feedback tools.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-400"
                  onClick={() => window.open('https://www.hotjar.com/', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-400"
                  onClick={() => window.open('https://help.hotjar.com/hc/en-us/articles/115011789688', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  API Docs
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="hotjar-site-id">Hotjar Site ID</Label>
                <Input
                  id="hotjar-site-id"
                  placeholder="e.g., 1234567"
                  value={config.projectId}
                  onChange={(e) => setConfig(prev => ({ ...prev, projectId: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Found in Hotjar → Organization & Sites → Site settings
                </p>
              </div>

              <div>
                <Label htmlFor="hotjar-api-token">Personal Access Token</Label>
                <Input
                  id="hotjar-api-token"
                  type="password"
                  placeholder="Your Hotjar API token"
                  value={config.apiToken}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiToken: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Generate at Hotjar → Account → Integrations → API
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Status & Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-400">Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-400">Not configured</span>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing || !config.projectId}
            >
              {testing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !config.projectId}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Configuration
            </Button>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            Important: Add Tracking Code
          </h4>
          <p className="text-sm text-muted-foreground">
            For heatmap data to be collected, you need to add the {provider === 'clarity' ? 'Clarity' : 'Hotjar'} tracking 
            code to your published pages. This is typically done in your CMS or website builder's settings.
          </p>
          <Button
            variant="link"
            className="p-0 h-auto mt-2"
            onClick={() => window.open(
              provider === 'clarity' 
                ? 'https://docs.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup'
                : 'https://help.hotjar.com/hc/en-us/articles/115011867948',
              '_blank'
            )}
          >
            View installation guide <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
