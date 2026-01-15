import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Trash2,
  TestTube
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey, 
  deleteApiKey,
  type ApiProvider 
} from "@/services/apiKeyService";
import { ApiProvider as ApiProviderType } from './types';

interface UnifiedProviderCardProps {
  provider: ApiProviderType;
  isRequired?: boolean;
}

export const UnifiedProviderCard = ({ provider, isRequired = false }: UnifiedProviderCardProps) => {
  const [apiKey, setApiKey] = useState("");
  const [maskedKey, setMaskedKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'unconfigured'>('unconfigured');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApiKey();
  }, [provider]);

  const loadApiKey = async () => {
    try {
      setIsLoading(true);
      const key = await getApiKey(provider.serviceKey as ApiProvider);
      
      if (key) {
        setApiKey(key);
        setMaskedKey(maskApiKey(key));
        setIsConfigured(true);
        setIsEnabled(true);
        setStatus('checking');
        
        // Test the key
        try {
          const success = await testApiKey(provider.serviceKey as ApiProvider, key);
          setStatus(success ? 'connected' : 'error');
          if (!success) {
            setError('API key verification failed');
          }
        } catch {
          setStatus('error');
          setError('Unable to verify API key');
        }
      } else {
        setStatus('unconfigured');
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••••••' + key.slice(-4);
  };

  const handleSave = async () => {
    const trimmedKey = apiKey.trim();
    
    // Basic validation only
    if (!trimmedKey) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    if (trimmedKey.length < 8) {
      toast.error('API key is too short (minimum 8 characters)');
      setError('API key is too short (minimum 8 characters)');
      return;
    }
    
    if (/\s/.test(trimmedKey)) {
      toast.error('API key cannot contain spaces');
      setError('API key cannot contain spaces');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const success = await saveApiKey(provider.serviceKey as ApiProvider, trimmedKey);
      
      if (success) {
        setMaskedKey(maskApiKey(trimmedKey));
        setIsConfigured(true);
        setIsEnabled(true);
        setStatus('checking');
        toast.success(`${provider.name} API key saved`);
        
        // Test after saving
        const testSuccess = await testApiKey(provider.serviceKey as ApiProvider, trimmedKey);
        setStatus(testSuccess ? 'connected' : 'error');
        
        if (testSuccess) {
          toast.success(`${provider.name} connection verified`);
        } else {
          // Key is saved even if test fails - show info not error
          setError('API key saved but verification failed - you may still be able to use it');
          toast.info(`${provider.name} saved, but connection test failed`);
        }
      }
    } catch (err: any) {
      console.error(`Failed to save ${provider.name} API key:`, err);
      setError(err.message || 'Failed to save API key');
      toast.error(err.message || `Failed to save ${provider.name} API key`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key to test');
      return;
    }

    try {
      setIsTesting(true);
      setError(null);
      
      const success = await testApiKey(provider.serviceKey as ApiProvider, apiKey);
      setStatus(success ? 'connected' : 'error');
      
      if (success) {
        toast.success(`${provider.name} connection verified`);
      } else {
        setError('API key verification failed');
        toast.error(`${provider.name} verification failed`);
      }
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
      toast.error(`Failed to test ${provider.name} connection`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const success = await deleteApiKey(provider.serviceKey as ApiProvider);
      
      if (success) {
        setApiKey("");
        setMaskedKey("");
        setIsConfigured(false);
        setIsEnabled(false);
        setStatus('unconfigured');
        setError(null);
        toast.success(`${provider.name} API key removed`);
      }
    } catch (err: any) {
      toast.error(`Failed to remove ${provider.name} API key`);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30';
      case 'error': return 'from-red-500/20 to-red-600/10 border-red-500/30';
      case 'checking': return 'from-amber-500/20 to-amber-600/10 border-amber-500/30';
      default: return 'from-muted/50 to-muted/20 border-border';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'checking': return <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-glass border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-24 animate-pulse mb-2" />
            <div className="h-3 bg-muted/50 rounded w-32 animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden bg-gradient-to-br ${getStatusColor()} backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <provider.icon className="h-4 w-4 text-primary" />
                </div>
                {getStatusIcon() && (
                  <div className="absolute -bottom-1 -right-1">
                    {getStatusIcon()}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{provider.name}</h3>
                  {isRequired && (
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{provider.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isConfigured && (
                <Switch
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 w-8 p-0"
              >
                <a href={provider.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Key Input */}
          <div className="space-y-3">
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder={`Enter ${provider.name} API key`}
                value={showKey ? apiKey : (isConfigured && !showKey ? maskedKey : apiKey)}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 bg-background/50"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !apiKey.trim()}
                  size="sm"
                  className="h-8"
                >
                  {isSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  Save
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isTesting || !apiKey.trim()}
                  size="sm"
                  className="h-8"
                >
                  {isTesting ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <TestTube className="h-3 w-3 mr-1" />
                  )}
                  Test
                </Button>
              </div>

              {isConfigured && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};