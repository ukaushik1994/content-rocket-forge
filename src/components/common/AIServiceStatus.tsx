import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Zap, Settings, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { useNavigate } from 'react-router-dom';

interface AIProviderStatus {
  id: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  priority: number;
  error_message?: string;
  last_verified?: string;
}

export function AIServiceStatus() {
  const navigate = useNavigate();
  const [isServiceEnabled, setIsServiceEnabled] = useState(true);
  const [providers, setProviders] = useState<AIProviderStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load AI service status and preferences
  useEffect(() => {
    loadServiceStatus();
  }, []);

  const loadServiceStatus = async () => {
    setIsLoading(true);
    try {
      // Check if AI service is globally enabled
      const enabled = await AIServiceController.isAIServiceEnabled();
      setIsServiceEnabled(enabled);

      // Get active providers
      const activeProviders = await AIServiceController.getActiveProviders();
      setProviders(activeProviders);
    } catch (error) {
      console.error('Error loading AI service status:', error);
      toast.error('Failed to load AI service status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleService = async (enabled: boolean) => {
    try {
      await saveUserPreference('enableAiService', enabled);
      setIsServiceEnabled(enabled);
      
      if (enabled) {
        toast.success('AI service enabled');
        // Refresh providers when enabling
        await loadServiceStatus();
      } else {
        toast.success('AI service disabled');
      }
    } catch (error) {
      console.error('Error toggling AI service:', error);
      toast.error('Failed to update AI service setting');
    }
  };

  const handleRefreshProviders = async () => {
    setIsRefreshing(true);
    try {
      // Clear cache and reload
      AIServiceController.clearCache();
      await loadServiceStatus();
      toast.success('Provider status refreshed');
    } catch (error) {
      console.error('Error refreshing providers:', error);
      toast.error('Failed to refresh provider status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProviderDisplayName = (provider: string) => {
    const names: Record<string, string> = {
      openrouter: 'OpenRouter',
      anthropic: 'Anthropic',
      openai: 'OpenAI',
      gemini: 'Google Gemini',
      mistral: 'Mistral AI',
      lmstudio: 'LM Studio'
    };
    return names[provider] || provider;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            <span>Loading AI service status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Service Status</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Service</span>
              <Switch
                checked={isServiceEnabled}
                onCheckedChange={handleToggleService}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshProviders}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isServiceEnabled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">AI Service Disabled</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              AI features are currently disabled. Enable the service to use AI-powered content generation and analysis.
            </p>
          </div>
        )}

        {isServiceEnabled && (
          <>
            {providers.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">No AI Providers Configured</span>
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  No AI providers are configured. Add at least one AI provider to use AI features.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Configure Providers
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Configured Providers (Priority Order)
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {providers.filter(p => p.status === 'active').length} of {providers.length} active
                  </Badge>
                </div>

                <div className="grid gap-2">
                  {providers
                    .sort((a, b) => a.priority - b.priority)
                    .map((provider, index) => (
                      <div
                        key={provider.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            {getStatusIcon(provider.status)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {getProviderDisplayName(provider.provider)}
                            </div>
                            {provider.error_message && (
                              <div className="text-xs text-red-600 mt-1">
                                {provider.error_message}
                              </div>
                            )}
                            {provider.last_verified && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Last verified: {new Date(provider.last_verified).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className={`text-xs capitalize ${getStatusColor(provider.status)}`}
                        >
                          {provider.status}
                        </Badge>
                      </div>
                    ))}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Providers are tried in priority order with automatic fallback</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/settings')}
                      className="h-8 px-2"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}