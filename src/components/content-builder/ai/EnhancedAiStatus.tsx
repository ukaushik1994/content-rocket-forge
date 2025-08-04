import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  RefreshCw,
  Settings,
  Brain
} from 'lucide-react';
import { getApiKey, testApiKey } from '@/services/apiKeyService';
import { AiProvider } from '@/services/aiService/types';
import { toast } from 'sonner';

interface AiProviderStatus {
  configured: boolean;
  working: boolean;
  testing: boolean;
}

interface AiApiStatus {
  [key: string]: AiProviderStatus;
}

interface EnhancedAiStatusProps {
  onStatusChange?: (status: AiApiStatus) => void;
}

const AI_PROVIDERS: AiProvider[] = ['openrouter', 'anthropic', 'openai', 'gemini', 'mistral', 'lmstudio'];

const PROVIDER_NAMES: Record<AiProvider, string> = {
  openrouter: 'OpenRouter',
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Gemini',
  mistral: 'Mistral',
  lmstudio: 'LM Studio'
};

export const EnhancedAiStatus: React.FC<EnhancedAiStatusProps> = ({
  onStatusChange
}) => {
  const [status, setStatus] = useState<AiApiStatus>({});
  const [isLoading, setIsLoading] = useState(true);
  const [workingProviders, setWorkingProviders] = useState<AiProvider[]>([]);

  const checkApiStatus = async () => {
    setIsLoading(true);
    console.log('🔍 Starting AI provider status check');
    
    const newStatus: AiApiStatus = {};
    const working: AiProvider[] = [];
    
    try {
      // Check each AI provider
      for (const provider of AI_PROVIDERS) {
        console.log(`🔍 Checking ${provider} key`);
        const apiKey = await getApiKey(provider);
        let isWorking = false;
        
        if (apiKey) {
          console.log(`✅ ${provider} key found in database, testing...`);
          
          // Set testing state
          setStatus(prev => ({
            ...prev,
            [provider]: { configured: true, working: false, testing: true }
          }));
          
          isWorking = await testApiKey(provider, apiKey);
          console.log(`📊 ${provider} test result:`, isWorking);
          
          if (isWorking) {
            working.push(provider);
          }
        } else {
          console.log(`❌ No ${provider} key found in database`);
        }
        
        newStatus[provider] = {
          configured: !!apiKey,
          working: isWorking,
          testing: false
        };
      }
      
      console.log('📊 Final AI provider status:', newStatus);
      console.log('✅ Working providers:', working);
      
      setStatus(newStatus);
      setWorkingProviders(working);
      onStatusChange?.(newStatus);
      
    } catch (error) {
      console.error('💥 Error checking AI provider status:', error);
      toast.error('Failed to check AI provider status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  const getOverallStatus = () => {
    const workingCount = workingProviders.length;
    
    if (workingCount >= 2) {
      return { status: 'excellent', label: `${workingCount} AI Providers Ready`, color: 'bg-green-600' };
    } else if (workingCount === 1) {
      return { status: 'good', label: '1 AI Provider Ready', color: 'bg-blue-600' };
    } else {
      return { status: 'none', label: 'Setup Required', color: 'bg-red-600' };
    }
  };

  const overallStatus = getOverallStatus();

  if (isLoading) {
    return (
      <Card className="border-neon-purple/20">
        <CardContent className="flex items-center justify-center py-6">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          <span>Checking AI provider status...</span>
        </CardContent>
      </Card>
    );
  }

  // Hide the component when at least one provider is working
  if (workingProviders.length > 0) {
    return null;
  }

  return (
    <Card className="border-neon-purple/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-neon-purple" />
            AI Provider Status
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
            <CheckCircle className="h-5 w-5 mr-2 text-white" />
            <span className="font-medium">Overall Status</span>
          </div>
          <Badge className={`${overallStatus.color} hover:${overallStatus.color}/80`}>
            {overallStatus.label}
          </Badge>
        </div>

        {/* Working Providers Grid - Only show configured and working providers */}
        {workingProviders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workingProviders.map((provider) => (
              <div key={provider} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{PROVIDER_NAMES[provider]}</span>
                  {status[provider]?.testing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Connected & Working
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Setup Actions - Show when no providers are working */}
        {workingProviders.length === 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
            <div className="text-sm">
              <p className="font-medium">Setup Required</p>
              <p className="text-muted-foreground">
                Configure at least one AI provider in Settings for content generation
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/settings?tab=api'}
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        )}

        {/* Content Generation Capability Indicator */}
        <div className="text-xs text-muted-foreground">
          <p>
            <span className="font-medium">Content Generation:</span>{' '}
            {workingProviders.length >= 2 ? 'Premium (Multiple Providers)' :
             workingProviders.length === 1 ? 'Standard (Single Provider)' :
             'Limited (No AI Providers)'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};