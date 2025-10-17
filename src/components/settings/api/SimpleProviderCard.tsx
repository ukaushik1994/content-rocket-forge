import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey,
  toggleApiKeyStatus,
  type ApiProvider 
} from "@/services/apiKeyService";
import { ApiProvider as ApiProviderType } from './types';
import { supabase } from '@/integrations/supabase/client';

interface SimpleProviderCardProps {
  provider: ApiProviderType;
}

export const SimpleProviderCard = ({ provider }: SimpleProviderCardProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'unconfigured' | 'connected' | 'error' | 'testing' | 'disabled'>('unconfigured');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    loadApiKey();
  }, [provider]);

  // Subscribe to real-time changes
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Listen to both ai_service_providers (for AI services) and api_keys (for all services)
      const channel = supabase
        .channel(`provider-${provider.serviceKey}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ai_service_providers',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new && (payload.new as any).provider === provider.serviceKey) {
              setIsEnabled((payload.new as any).status === 'active');
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'api_keys',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new && (payload.new as any).service === provider.serviceKey) {
              setIsEnabled((payload.new as any).is_active);
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    };
    
    setupSubscription();
  }, [provider.serviceKey]);

  const loadApiKey = async () => {
    try {
      setIsLoading(true);
      const key = await getApiKey(provider.serviceKey as ApiProvider);
      
      if (key) {
        setApiKey(key);
        setStatus('testing');
        
        // Check provider status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // First try ai_service_providers (for AI services)
          const { data: providerData } = await supabase
            .from('ai_service_providers')
            .select('status')
            .eq('user_id', user.id)
            .eq('provider', provider.serviceKey)
            .maybeSingle();
          
          if (providerData) {
            setIsEnabled(providerData.status === 'active');
          } else {
            // Fall back to api_keys table (for non-AI services like SERP)
            const { data: apiKeyData } = await supabase
              .from('api_keys')
              .select('is_active')
              .eq('user_id', user.id)
              .eq('service', provider.serviceKey)
              .maybeSingle();
            
            setIsEnabled(apiKeyData?.is_active ?? true);
          }
        }
        
        // Test the key
        const success = await testApiKey(provider.serviceKey as ApiProvider, key);
        setStatus(success ? 'connected' : 'error');
      } else {
        setStatus('unconfigured');
      }
    } catch {
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    try {
      setIsSaving(true);
      
      const success = await saveApiKey(provider.serviceKey as ApiProvider, apiKey);
      
      if (success) {
        setStatus('testing');
        toast.success('API key saved');
        
        // Test after saving
        const testSuccess = await testApiKey(provider.serviceKey as ApiProvider, apiKey);
        setStatus(testSuccess ? 'connected' : 'error');
        
        if (testSuccess) {
          toast.success('Connection verified');
        }
      }
    } catch (err: any) {
      toast.error('Failed to save API key');
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = !isEnabled;
    
    try {
      const success = await toggleApiKeyStatus(provider.serviceKey as ApiProvider, newStatus);
      if (success) {
        setIsEnabled(newStatus);
        setStatus(newStatus ? (status === 'disabled' ? 'connected' : status) : 'disabled');
        toast.success(`${provider.name} ${newStatus ? 'enabled' : 'disabled'}`);
        
        // Reload to sync database state
        await loadApiKey();
      }
    } catch (error) {
      toast.error('Failed to update API key status');
    }
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'connected': 
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'disabled':
        return <div className="w-2 h-2 bg-muted-foreground/40 rounded-full" />;
      case 'error': 
        return <div className="w-2 h-2 bg-destructive rounded-full" />;
      case 'testing': 
        return <Loader2 className="w-3 h-3 animate-spin text-primary" />;
      default: 
        return <div className="w-2 h-2 bg-muted-foreground/40 rounded-full" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'disabled': return 'Disabled';
      case 'error': return 'Error';
      case 'testing': return 'Testing...';
      default: return 'Not configured';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-between py-2 px-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-muted animate-pulse" />
          <div className="h-4 bg-muted rounded w-20 animate-pulse" />
        </div>
        <div className="w-2 h-2 bg-muted animate-pulse rounded-full" />
      </div>
    );
  }

  // Ultra-minimal collapsed state
  if (!isExpanded) {
    return (
      <div className="group">
        <Button
          variant="ghost"
          className="w-full h-auto p-0 justify-start hover:bg-accent/50"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center justify-between w-full py-2 px-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center shrink-0">
                <provider.icon className="h-2.5 w-2.5 text-primary" />
              </div>
              <span className="font-medium text-sm text-left">{provider.name}</span>
              {provider.required && status === 'unconfigured' && (
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIndicator()}
              <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </div>
        </Button>
      </div>
    );
  }

  // Expanded state with full configuration
  return (
    <div className="border rounded-lg bg-card">
      {/* Collapsible header */}
      <Button
        variant="ghost"
        className="w-full h-auto p-0 justify-start hover:bg-accent/50"
        onClick={() => setIsExpanded(false)}
      >
        <div className="flex items-center justify-between w-full py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
              <provider.icon className="h-3 w-3 text-primary" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{provider.name}</span>
                {provider.required && (
                  <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">Required</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{provider.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIndicator()}
            <span className="text-xs text-muted-foreground">{getStatusText()}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </Button>

      {/* Configuration section */}
      <div className={`px-4 pb-4 space-y-4 border-t bg-muted/20 transition-opacity ${!isEnabled ? 'opacity-60' : ''}`}>
        {/* Enable/Disable Toggle - Show for any configured service */}
        {(status !== 'unconfigured' || apiKey.trim()) && (
          <div className="flex items-center justify-between pt-3 pb-2 border-b">
            <Label htmlFor={`enable-${provider.serviceKey}`} className="text-sm font-medium">
              Enable Service
            </Label>
            <Switch
              id={`enable-${provider.serviceKey}`}
              checked={isEnabled}
              onCheckedChange={handleToggleStatus}
            />
          </div>
        )}

        {/* API Key Input */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              placeholder={`Enter ${provider.name} API key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10 text-sm"
              disabled={status === 'disabled' && !apiKey.trim()}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-2"
              onClick={() => setShowKey(!showKey)}
              type="button"
              disabled={status === 'disabled' && !apiKey.trim()}
            >
              {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !apiKey.trim()}
              size="sm"
            >
              {isSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              Save & Test
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={provider.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Get Key
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};