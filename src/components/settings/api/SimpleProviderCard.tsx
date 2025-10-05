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

  const loadApiKey = async () => {
    try {
      setIsLoading(true);
      const key = await getApiKey(provider.serviceKey as ApiProvider);
      
      if (key) {
        setApiKey(key);
        
        // Check if the key is enabled (check correct table based on provider)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (provider.serviceKey === 'openrouter') {
            // OpenRouter uses user_llm_keys table
            const { data } = await supabase
              .from('user_llm_keys')
              .select('is_active')
              .eq('user_id', user.id)
              .eq('provider', 'openrouter')
              .single();
            
            if (data) {
              setIsEnabled(data.is_active ?? true);
              setStatus(data.is_active ? 'testing' : 'disabled');
            }
          } else {
            // Other providers use api_keys table
            const { data } = await supabase
              .from('api_keys')
              .select('is_active')
              .eq('user_id', user.id)
              .eq('service', provider.serviceKey)
              .single();
            
            if (data) {
              setIsEnabled(data.is_active ?? true);
              setStatus(data.is_active ? 'testing' : 'disabled');
            }
          }
        }
        
        // Only test if enabled
        if (isEnabled) {
          setStatus('testing');
          const success = await testApiKey(provider.serviceKey as ApiProvider, key);
          setStatus(success ? 'connected' : 'error');
        }
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
        {/* Enable/Disable Toggle - Only show if key exists */}
        {status !== 'unconfigured' && (
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
              disabled={!isEnabled && status !== 'unconfigured'}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-2"
              onClick={() => setShowKey(!showKey)}
              type="button"
              disabled={!isEnabled && status !== 'unconfigured'}
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
              disabled={isSaving || !apiKey.trim() || (!isEnabled && status !== 'unconfigured')}
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