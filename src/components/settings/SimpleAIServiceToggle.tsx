import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';

export function SimpleAIServiceToggle() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [providerCount, setProviderCount] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [isServiceEnabled, activeProviders] = await Promise.all([
        Promise.resolve(getUserPreference('enableAiService')),
        AIServiceController.getActiveProviders()
      ]);
      
      setIsEnabled(isServiceEnabled !== false);
      setProviderCount(activeProviders.length);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    try {
      await saveUserPreference('enableAiService', enabled);
      setIsEnabled(enabled);
      
      if (enabled && providerCount === 0) {
        toast.info('Enable AI service and configure at least one provider to get started');
      }
      
      toast.success(`AI Service ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update AI service settings');
    }
  };

  const getStatusBadge = () => {
    if (!isEnabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    if (providerCount === 0) {
      return <Badge variant="destructive">No Providers</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Service
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-medium">Enable AI Service</span>
            {getStatusBadge()}
          </div>
          <Switch 
            checked={isEnabled} 
            onCheckedChange={handleToggle}
          />
        </div>
        
        {isEnabled && providerCount === 0 && (
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            AI service is enabled but no providers are configured. Add at least one AI provider below to start using AI features.
          </div>
        )}
        
        {!isEnabled && (
          <div className="text-sm text-muted-foreground">
            Enable AI service to use AI-powered features throughout the application.
          </div>
        )}
      </CardContent>
    </Card>
  );
}