
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  Settings,
  Zap
} from 'lucide-react';
import { getApiKey, testApiKey } from '@/services/apiKeyService';
import { toast } from 'sonner';
import { useSettings } from '@/contexts/SettingsContext';

interface SerpApiStatus {
  serpApi: {
    configured: boolean;
    working: boolean;
    testing: boolean;
  };
  serpstack: {
    configured: boolean;
    working: boolean;
    testing: boolean;
  };
}

interface EnhancedSerpStatusProps {
  onStatusChange?: (status: SerpApiStatus) => void;
}

export const EnhancedSerpStatus: React.FC<EnhancedSerpStatusProps> = ({
  onStatusChange
}) => {
  const [status, setStatus] = useState<SerpApiStatus>({
    serpApi: { configured: false, working: false, testing: false },
    serpstack: { configured: false, working: false, testing: false }
  });
  const [isLoading, setIsLoading] = useState(true);
  const { openSettings } = useSettings();

  const checkApiStatus = async () => {
    setIsLoading(true);
    console.log('🔍 Starting comprehensive API status check');
    
    try {
      // Check SerpAPI
      console.log('🔍 Checking SerpAPI key');
      const serpApiKey = await getApiKey('serp');
      let serpApiWorking = false;
      
      if (serpApiKey) {
        console.log('✅ SerpAPI key found in database, testing...');
        setStatus(prev => ({
          ...prev,
          serpApi: { ...prev.serpApi, configured: true, testing: true }
        }));
        
        serpApiWorking = await testApiKey('serp', serpApiKey);
        console.log('📊 SerpAPI test result:', serpApiWorking);
      } else {
        console.log('❌ No SerpAPI key found in database');
      }
      
      // Check Serpstack
      console.log('🔍 Checking Serpstack key');
      const serpstackKey = await getApiKey('serpstack');
      let serpstackWorking = false;
      
      if (serpstackKey) {
        console.log('✅ Serpstack key found in database, testing...');
        setStatus(prev => ({
          ...prev,
          serpstack: { ...prev.serpstack, configured: true, testing: true }
        }));
        
        serpstackWorking = await testApiKey('serpstack', serpstackKey);
        console.log('📊 Serpstack test result:', serpstackWorking);
      } else {
        console.log('❌ No Serpstack key found in database');
      }
      
      const newStatus = {
        serpApi: {
          configured: !!serpApiKey,
          working: serpApiWorking,
          testing: false
        },
        serpstack: {
          configured: !!serpstackKey,
          working: serpstackWorking,
          testing: false
        }
      };
      
      console.log('📊 Final API status:', newStatus);
      setStatus(newStatus);
      onStatusChange?.(newStatus);
      
    } catch (error) {
      console.error('💥 Error checking SERP API status:', error);
      toast.error('Failed to check SERP API status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  const getOverallStatus = () => {
    const { serpApi, serpstack } = status;
    
    if (serpApi.working && serpstack.working) {
      return { status: 'excellent', label: 'Both APIs Ready', color: 'bg-green-600', icon: CheckCircle };
    } else if (serpApi.working || serpstack.working) {
      return { status: 'partial', label: 'One API Ready', color: 'bg-yellow-600', icon: AlertCircle };
    } else if (serpApi.configured || serpstack.configured) {
      return { status: 'configured', label: 'APIs Configured', color: 'bg-blue-600', icon: AlertCircle };
    } else {
      return { status: 'none', label: 'Setup Required', color: 'bg-red-600', icon: XCircle };
    }
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  if (isLoading) {
    return (
      <Card className="border-neon-purple/20">
        <CardContent className="flex items-center justify-center py-6">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          <span>Checking SERP API status...</span>
        </CardContent>
      </Card>
    );
  }

  // Hide the component when both APIs are ready
  if (status.serpApi.working && status.serpstack.working) {
    return null;
  }

  return (
    <Card className="border-neon-purple/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-neon-purple" />
            Enhanced SERP Status
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkApiStatus}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center">
            <StatusIcon className="h-5 w-5 mr-2 text-white" />
            <span className="font-medium">Overall Status</span>
          </div>
          <Badge className={`${overallStatus.color} hover:${overallStatus.color}/80`}>
            {overallStatus.label}
          </Badge>
        </div>

        {/* Individual API Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SerpAPI Status */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">SerpAPI</span>
              {status.serpApi.testing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : status.serpApi.working ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : status.serpApi.configured ? (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {status.serpApi.working ? 'Connected & Working' :
               status.serpApi.configured ? 'Configured but not working' :
               'Not configured'}
            </div>
          </div>

          {/* Serpstack Status */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Serpstack</span>
              {status.serpstack.testing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : status.serpstack.working ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : status.serpstack.configured ? (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {status.serpstack.working ? 'Connected & Working' :
               status.serpstack.configured ? 'Configured but not working' :
               'Not configured'}
            </div>
          </div>
        </div>

        {/* Setup Actions */}
        {(!status.serpApi.configured && !status.serpstack.configured) && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
            <div className="text-sm">
              <p className="font-medium">Setup Required</p>
              <p className="text-muted-foreground">
                Configure your SERP API keys in Settings for optimal performance
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openSettings('api')}
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        )}

        {/* Configuration Issues Warning */}
        {(status.serpApi.configured && !status.serpApi.working) || (status.serpstack.configured && !status.serpstack.working) ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-600/10 border border-yellow-600/20">
            <div className="text-sm">
              <p className="font-medium">Configuration Issues Detected</p>
              <p className="text-muted-foreground">
                Some API keys are configured but not working. Please check your Settings.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openSettings('api')}
            >
              <Settings className="h-4 w-4 mr-1" />
              Fix Issues
            </Button>
          </div>
        ) : null}

        {/* Data Quality Indicator */}
        <div className="text-xs text-muted-foreground">
          <p>
            <span className="font-medium">Data Quality:</span>{' '}
            {status.serpApi.working && status.serpstack.working ? 'Premium (Trends + SERP)' :
             status.serpApi.working || status.serpstack.working ? 'Standard (Single Source)' :
             'Limited (Mock Data)'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
