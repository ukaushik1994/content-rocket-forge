import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ModelInfo {
  id: string;
  name: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

export const OpenRouterSettings = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [detectedModel, setDetectedModel] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadExistingKey();
    }
  }, [user]);

  const loadExistingKey = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_llm_keys')
        .select('api_key, model, is_active')
        .eq('user_id', user?.id)
        .eq('provider', 'openrouter')
        .single();

      if (data && !error) {
        setApiKey(data.api_key);
        setSelectedModel(data.model || '');
        setKeyExists(true);
        setIsVerified(data.is_active);
        
        // Verify the existing key
        if (data.is_active) {
          await verifyExistingKey(data.api_key);
        }
      }
    } catch (error: any) {
      console.log('No existing OpenRouter key found');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyExistingKey = async (key: string) => {
    try {
      const { data } = await supabase.functions.invoke('verify-openrouter-key', {
        body: { api_key: key }
      });

      if (data?.success) {
        setIsVerified(true);
        setDetectedModel(data.model);
        setAvailableModels(data.availableModels || []);
        if (!selectedModel && data.model) {
          setSelectedModel(data.model);
        }
      }
    } catch (error) {
      console.error('Error verifying existing key:', error);
    }
  };

  const handleVerifyKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    try {
      setIsVerifying(true);
      console.log('🔍 Verifying OpenRouter API key...');

      const { data, error } = await supabase.functions.invoke('verify-openrouter-key', {
        body: { api_key: apiKey }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        setIsVerified(true);
        setDetectedModel(data.model);
        setAvailableModels(data.availableModels || []);
        
        if (data.model) {
          setSelectedModel(data.model);
          toast.success(`✅ Connected! Default model: ${data.model}`);
        } else {
          toast.success('✅ API key verified successfully');
        }

        console.log(`✅ OpenRouter key verified. Found ${data.modelCount} models`);
      } else {
        throw new Error(data?.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('❌ OpenRouter verification failed:', error);
      setIsVerified(false);
      toast.error(`❌ ${error.message || 'Invalid API key or connection failed'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveKey = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!isVerified) {
      toast.error('Please verify the API key first');
      return;
    }

    try {
      setIsSaving(true);
      console.log('💾 Saving OpenRouter configuration...');

      const { error } = await supabase
        .from('user_llm_keys')
        .upsert({
          user_id: user.id,
          provider: 'openrouter',
          api_key: apiKey,
          model: selectedModel,
          is_active: true
        });

      if (error) throw error;

      setKeyExists(true);
      toast.success('🎉 OpenRouter configuration saved successfully!');
      console.log('✅ OpenRouter configuration saved');

    } catch (error: any) {
      console.error('💥 Error saving OpenRouter config:', error);
      toast.error(`Failed to save configuration: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_llm_keys')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', 'openrouter');

      if (error) throw error;

      setApiKey('');
      setSelectedModel('');
      setKeyExists(false);
      setIsVerified(false);
      setAvailableModels([]);
      setDetectedModel(null);
      
      toast.success('OpenRouter configuration deleted');
    } catch (error: any) {
      toast.error(`Failed to delete configuration: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-border/50 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-neon-purple/20 p-2 border border-neon-purple/30">
              <Brain className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">OpenRouter</CardTitle>
              <CardDescription>
                Access multiple AI models through a single API gateway
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-neon-purple/20 bg-gradient-to-r from-background/90 to-neon-purple/5 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-neon-purple/20 p-2 border border-neon-purple/30">
              <Brain className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                OpenRouter
                {isVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                {keyExists && !isVerified && <XCircle className="h-4 w-4 text-red-500" />}
              </CardTitle>
              <CardDescription>
                Access multiple AI models (GPT-4, Claude, Mistral, LLaMA) through a single API
              </CardDescription>
            </div>
          </div>
          {detectedModel && (
            <Badge variant="secondary" className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
              {detectedModel}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* API Key Input */}
        <div className="space-y-2">
          <Label htmlFor="openrouter-key">API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="openrouter-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            <Button
              onClick={handleVerifyKey}
              disabled={isVerifying || !apiKey.trim()}
              variant="outline"
            >
              {isVerifying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Get your API key from{' '}
            <a 
              href="https://openrouter.ai/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neon-purple hover:underline"
            >
              OpenRouter Dashboard
            </a>
          </p>
        </div>

        {/* Model Selection */}
        {isVerified && availableModels.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="model-select">Default Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model..." />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{model.name || model.id}</span>
                      {model.pricing && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ${model.pricing.prompt}/${model.pricing.completion}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This model will be used by default for content generation
            </p>
          </div>
        )}

        {/* Status Display */}
        {isVerified && (
          <div className="bg-green-900/20 border border-green-500/30 p-3 rounded-md">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Connected Successfully</span>
            </div>
            <p className="text-sm text-green-200 mt-1">
              Found {availableModels.length} available models
              {detectedModel && ` • Default: ${detectedModel}`}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSaveKey}
            disabled={isSaving || !isVerified}
            className="flex-1"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {keyExists ? 'Update Configuration' : 'Save Configuration'}
          </Button>
          
          {keyExists && (
            <Button
              onClick={handleDeleteKey}
              variant="destructive"
              size="sm"
            >
              Delete
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-md text-sm">
          <p className="text-blue-300 font-medium mb-1">💡 OpenRouter Benefits:</p>
          <ul className="text-blue-200 space-y-1 text-xs">
            <li>• Access GPT-4, Claude, Mistral, and LLaMA through one API</li>
            <li>• Competitive pricing and no vendor lock-in</li>
            <li>• Automatic failover between providers</li>
            <li>• Real-time usage tracking and cost estimates</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};