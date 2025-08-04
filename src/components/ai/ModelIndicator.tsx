import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Brain, Settings, Loader2 } from 'lucide-react';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ModelIndicatorProps {
  onModelChange?: (model: string) => void;
  className?: string;
}

const AVAILABLE_MODELS = [
  { id: 'openai/gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
  { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', provider: 'Mistral' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'LLaMA 3 70B', provider: 'Meta' }
];

export const ModelIndicator: React.FC<ModelIndicatorProps> = ({ 
  onModelChange, 
  className = '' 
}) => {
  const { user } = useAuth();
  const { getCurrentModel } = useOpenRouter();
  const [currentModel, setCurrentModel] = useState<string>('openai/gpt-4');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadCurrentModel();
  }, [user]);

  const loadCurrentModel = async () => {
    try {
      setIsLoading(true);
      const model = await getCurrentModel();
      if (model) {
        setCurrentModel(model);
      }
    } catch (error) {
      console.error('Error loading current model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = async (newModel: string) => {
    if (!user?.id) return;

    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('user_llm_keys')
        .update({ model: newModel })
        .eq('user_id', user.id)
        .eq('provider', 'openrouter');

      if (error) throw error;

      setCurrentModel(newModel);
      onModelChange?.(newModel);
      setIsOpen(false);
      
      const modelInfo = AVAILABLE_MODELS.find(m => m.id === newModel);
      toast.success(`Model updated to ${modelInfo?.name || newModel}`);
      
    } catch (error: any) {
      console.error('Error updating model:', error);
      toast.error(`Failed to update model: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentModelInfo = () => {
    return AVAILABLE_MODELS.find(m => m.id === currentModel) || {
      id: currentModel,
      name: currentModel,
      provider: 'Unknown'
    };
  };

  const modelInfo = getCurrentModelInfo();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading model...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <Brain className="h-3 w-3 text-neon-purple" />
        <span className="text-xs text-muted-foreground">Model:</span>
      </div>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs font-medium bg-neon-purple/10 hover:bg-neon-purple/20 border border-neon-purple/20"
          >
            {modelInfo.name}
            <Settings className="h-3 w-3 ml-1" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-3" align="end">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-1">Current Model</h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {modelInfo.provider}
                </Badge>
                <span className="text-sm font-medium">{modelInfo.name}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Change Model</label>
              <Select 
                value={currentModel} 
                onValueChange={handleModelChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{model.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {model.provider}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              <p className="font-medium mb-1">💡 Model Selection Tips:</p>
              <ul className="space-y-1">
                <li>• GPT-4: Best for complex reasoning and analysis</li>
                <li>• Claude 3: Excellent for creative writing</li>
                <li>• GPT-3.5: Fast and cost-effective for simple tasks</li>
                <li>• Mistral/LLaMA: Open-source alternatives</li>
              </ul>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {isUpdating && (
        <Loader2 className="h-3 w-3 animate-spin text-neon-purple" />
      )}
    </div>
  );
};