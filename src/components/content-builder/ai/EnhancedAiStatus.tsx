import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  RefreshCw,
  Settings,
  Brain
} from 'lucide-react';
import { useAIServiceStatus } from '@/hooks/useAIServiceStatus';
import { useSettings } from '@/contexts/SettingsContext';

interface EnhancedAiStatusProps {
  onStatusChange?: () => void;
}

export const EnhancedAiStatus: React.FC<EnhancedAiStatusProps> = ({
  onStatusChange
}) => {
  // Use only the AI service status hook
  const aiServiceStatus = useAIServiceStatus();
  const { openSettings } = useSettings();

  const getOverallStatus = () => {
    const workingCount = aiServiceStatus.activeProviders;
    
    if (workingCount >= 2) {
      return { status: 'excellent', label: `${workingCount} AI Providers Ready`, color: 'bg-green-600' };
    } else if (workingCount === 1) {
      return { status: 'good', label: '1 AI Provider Ready', color: 'bg-blue-600' };
    } else {
      return { status: 'none', label: 'Setup Required', color: 'bg-red-600' };
    }
  };

  const overallStatus = getOverallStatus();

  if (aiServiceStatus.isLoading) {
    return (
      <Card className="border-neon-purple/20">
        <CardContent className="flex items-center justify-center py-6">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          <span>Checking AI provider status...</span>
        </CardContent>
      </Card>
    );
  }

  // Show minimized status when providers are working
  const showMinimized = aiServiceStatus.activeProviders > 0;

  if (showMinimized) {
    return (
      <Card className="border-green-500/20 bg-green-950/10">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
              <span className="text-sm font-medium">AI Service Ready</span>
              <Badge className="ml-2 bg-green-600 hover:bg-green-600/80 text-xs">
                {aiServiceStatus.activeProviders} Provider{aiServiceStatus.activeProviders > 1 ? 's' : ''}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                aiServiceStatus.refreshStatus();
                onStatusChange?.();
              }}
              disabled={aiServiceStatus.isLoading}
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
            onClick={() => {
              aiServiceStatus.refreshStatus();
              onStatusChange?.();
            }}
            disabled={aiServiceStatus.isLoading}
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
            onClick={() => openSettings('api')}
          >
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </Button>
        </div>

        {/* Content Generation Capability Indicator */}
        <div className="text-xs text-muted-foreground">
          <p>
            <span className="font-medium">Content Generation:</span>{' '}
            {aiServiceStatus.activeProviders > 0 ? `Ready (${aiServiceStatus.activeProviders} Providers)` : 'Limited (No AI Providers)'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};