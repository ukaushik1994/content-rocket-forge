import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey, 
  type ApiProvider 
} from "@/services/apiKeyService";
import { ApiProvider as ApiProviderType } from './types';

interface SimpleProviderCardProps {
  provider: ApiProviderType;
}

export const SimpleProviderCard = ({ provider }: SimpleProviderCardProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'unconfigured' | 'connected' | 'error' | 'testing'>('unconfigured');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, [provider]);

  const loadApiKey = async () => {
    try {
      setIsLoading(true);
      const key = await getApiKey(provider.serviceKey as ApiProvider);
      
      if (key) {
        setApiKey(key);
        setStatus('testing');
        
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

  const getStatusIndicator = () => {
    switch (status) {
      case 'connected': 
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'error': 
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'testing': 
        return <Loader2 className="w-3 h-3 animate-spin text-amber-500" />;
      default: 
        return <div className="w-2 h-2 bg-muted-foreground rounded-full" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-muted animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-24 animate-pulse mb-1" />
            <div className="h-3 bg-muted/50 rounded w-32 animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
            <provider.icon className="h-3 w-3 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">{provider.name}</h3>
              {getStatusIndicator()}
            </div>
            <p className="text-xs text-muted-foreground">{provider.description}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-6 w-6 p-0"
        >
          <a href={provider.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>

      {/* API Key Input */}
      <div className="space-y-2">
        <Label htmlFor={`${provider.serviceKey}-key`} className="text-xs">API Key</Label>
        <div className="relative">
          <Input
            id={`${provider.serviceKey}-key`}
            type={showKey ? "text" : "password"}
            placeholder={`Enter ${provider.name} API key`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="pr-10 text-sm"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2"
            onClick={() => setShowKey(!showKey)}
            type="button"
          >
            {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handleSave}
          disabled={isSaving || !apiKey.trim()}
          size="sm"
        >
          {isSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          Save
        </Button>
        
        <div className="text-xs text-muted-foreground">
          {status === 'connected' && 'Connected'}
          {status === 'error' && 'Connection failed'}
          {status === 'testing' && 'Testing...'}
          {status === 'unconfigured' && 'Not configured'}
        </div>
      </div>
    </Card>
  );
};