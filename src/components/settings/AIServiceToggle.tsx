import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import AIServiceController from '@/services/aiService/AIServiceController';

export function AIServiceToggle() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceStatus, setServiceStatus] = useState<{
    hasProviders: boolean;
    activeCount: number;
    totalCount: number;
  }>({ hasProviders: false, activeCount: 0, totalCount: 0 });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Get current preference (default to true)
      const enabled = getUserPreference('enableAiService');
      setIsEnabled(enabled !== false);

      // Check provider status
      const providers = await AIServiceController.getActiveProviders();
      setServiceStatus({
        hasProviders: providers.length > 0,
        activeCount: providers.filter(p => p.status === 'active').length,
        totalCount: providers.length
      });
    } catch (error) {
      console.error('Error loading AI service settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    try {
      await saveUserPreference('enableAiService', enabled);
      setIsEnabled(enabled);
      
      // Clear cache to refresh provider status
      AIServiceController.clearCache();
      
      if (enabled) {
        toast.success('AI service enabled');
      } else {
        toast.success('AI service disabled');
      }
    } catch (error) {
      console.error('Error toggling AI service:', error);
      toast.error('Failed to update AI service setting');
    }
  };

  const getStatusBadge = () => {
    if (!isEnabled) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Disabled
        </Badge>
      );
    }

    if (!serviceStatus.hasProviders) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          No Providers
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active ({serviceStatus.activeCount}/{serviceStatus.totalCount})
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse">Loading AI service settings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">AI Service</CardTitle>
              <CardDescription>
                Enable or disable all AI-powered features across the platform
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {!isEnabled && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">AI Features Disabled</h4>
                  <p className="text-sm text-gray-600">
                    All AI-powered features are currently disabled. This includes:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc">
                    <li>Content generation and optimization</li>
                    <li>Title and meta description suggestions</li>
                    <li>Outline creation and content analysis</li>
                    <li>Content repurposing and strategy recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isEnabled && !serviceStatus.hasProviders && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">No AI Providers Configured</h4>
                  <p className="text-sm text-yellow-700">
                    AI service is enabled but no providers are configured. Configure at least one AI provider below to use AI features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isEnabled && serviceStatus.hasProviders && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">AI Service Active</h4>
                  <p className="text-sm text-green-700">
                    AI features are enabled with {serviceStatus.activeCount} of {serviceStatus.totalCount} providers active. 
                    The system will automatically use the highest priority working provider with fallback support.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Note:</strong> When disabled, all AI functionality will be blocked regardless of configured API keys. 
              This setting affects the entire platform including content generation, optimization, and analysis features.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}