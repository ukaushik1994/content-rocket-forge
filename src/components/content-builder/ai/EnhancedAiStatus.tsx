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
import { AiProvider } from '@/services/aiService/types';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';
import { useAIServiceStatus } from '@/hooks/useAIServiceStatus';

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
  
  // Check AI service status only
  const aiServiceStatus = useAIServiceStatus();

  const checkApiStatus = async () => {
    setIsLoading(true);
    console.log('🔍 Starting AI provider status check');
    
    try {
      // Use the centralized AI service for fresh data
      const activeProviders = await AIServiceController.getActiveProviders();
      
      console.log('📊 Active providers:', activeProviders);
      
      const newStatus: AiApiStatus = {};
      const working: AiProvider[] = [];
      
      // Process all providers to maintain compatibility with the interface
      for (const provider of AI_PROVIDERS) {
        const activeProvider = activeProviders.find(p => p.provider === provider);
        const isConfigured = !!activeProvider;
        const isWorking = activeProvider?.status === 'active';
        
        newStatus[provider] = {
          configured: isConfigured,
          working: isWorking || false,
          testing: false
        };
        
        if (isWorking) {
          working.push(provider);
        }
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
    
    // Set up automatic refresh every 30 seconds when not loading
    const interval = setInterval(() => {
      if (!isLoading) {
        checkApiStatus();
      }
    }, 30000);
    
    return () => clearInterval(interval);
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

  // Show minimized status when providers are working, hide only if user prefers
  const showMinimized = workingProviders.length > 0;

  if (showMinimized) {
    return (
      <Card className="border-green-500/20 bg-green-950/10">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
              <span className="text-sm font-medium">AI Service Ready</span>
              <Badge className="ml-2 bg-green-600 hover:bg-green-600/80 text-xs">
                {workingProviders.length} Provider{workingProviders.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={checkApiStatus}
              disabled={isLoading}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
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

        {/* Setup Actions - Show when no providers are working */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
          <div className="text-sm">
            <p className="font-medium">AI Provider Setup Required</p>
            <p className="text-muted-foreground">
              Configure OpenAI, Anthropic, or other AI providers for content generation
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/settings?tab=api'}
          >
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </Button>
        </div>

        {/* Content Generation Capability Indicator */}
        <div className="text-xs text-muted-foreground">
          <p>
            <span className="font-medium">Content Generation:</span>{' '}
            Limited (No AI Providers)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};