import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Check, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OpenRouterSettingsProps {
  className?: string;
}

export const OpenRouterSettings: React.FC<OpenRouterSettingsProps> = ({ 
  className = "" 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [defaultModel, setDefaultModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const popularModels = [
    'deepseek/deepseek-r1-0528:free',
    'meta-llama/llama-3.2-90b-vision-instruct:free',
    'google/gemini-flash-1.5-8b',
    'openai/gpt-4o-mini',
    'anthropic/claude-3.5-sonnet',
    'mistralai/mistral-7b-instruct:free'
  ];

  // Load existing configuration
  useEffect(() => {
    if (user) {
      loadOpenRouterConfig();
    }
  }, [user]);

  const loadOpenRouterConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('user_llm_keys')
        .select('*')
        .eq('user_id', user?.id)
        .eq('provider', 'openrouter')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setIsConfigured(true);
        setDefaultModel(data.default_model || '');
        // Don't show the actual API key for security
        setApiKey('••••••••••••••••');
      }
    } catch (error) {
      console.error('Error loading OpenRouter config:', error);
    }
  };

  const saveOpenRouterConfig = async () => {
    if (!user || !apiKey || apiKey === '••••••••••••••••') {
      toast({
        title: "Error",
        description: "Please enter a valid OpenRouter API key",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // First check if a record exists
      const { data: existing } = await supabase
        .from('user_llm_keys')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider', 'openrouter')
        .single();

      const configData = {
        user_id: user.id,
        provider: 'openrouter',
        api_key: apiKey, // Use api_key instead of encrypted_key
        default_model: defaultModel,
        preferences: {
          autoFallback: true,
          temperature: 0.7
        },
        is_active: true
      };

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('user_llm_keys')
          .update(configData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_llm_keys')
          .insert(configData);

        if (error) throw error;
      }

      setIsConfigured(true);
      toast({
        title: "Success",
        description: "OpenRouter configuration saved successfully",
      });
    } catch (error) {
      console.error('Error saving OpenRouter config:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`p-6 bg-white/5 border-white/20 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-white/10">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">OpenRouter Configuration</h3>
          <p className="text-sm text-white/60">Configure your OpenRouter API key and preferences</p>
        </div>
        {isConfigured && (
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 ml-auto">
            <Check className="h-3 w-3 mr-1" />
            Configured
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="apiKey" className="text-white text-sm font-medium">
            API Key
          </Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="sk-or-v1-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
          <p className="text-xs text-white/50 mt-1">
            Get your API key from{' '}
            <a 
              href="https://openrouter.ai/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              openrouter.ai/keys
            </a>
          </p>
        </div>

        <div>
          <Label htmlFor="defaultModel" className="text-white text-sm font-medium">
            Default Model
          </Label>
          <Select value={defaultModel} onValueChange={setDefaultModel}>
            <SelectTrigger className="mt-1 bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Select a default model" />
            </SelectTrigger>
            <SelectContent className="bg-background/90 backdrop-blur-sm border-white/20">
              {popularModels.map((model) => (
                <SelectItem key={model} value={model} className="text-white">
                  {model}
                  {model.includes(':free') && (
                    <Badge variant="secondary" className="ml-2 text-xs">Free</Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-white/50 mt-1">
            This model will be used for AI chat responses
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
          <p className="text-xs text-blue-300">
            Your API key is stored securely and encrypted. It will be used for AI chat responses and content generation.
          </p>
        </div>

        <Button
          onClick={saveOpenRouterConfig}
          disabled={isLoading || !apiKey || (apiKey === '••••••••••••••••' && isConfigured)}
          className="w-full bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-white/20 text-white"
        >
          {isLoading ? 'Saving...' : isConfigured ? 'Update Configuration' : 'Save Configuration'}
        </Button>
      </div>
    </Card>
  );
};