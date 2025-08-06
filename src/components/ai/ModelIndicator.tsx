import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Brain, Settings, Loader2 } from 'lucide-react';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { useAuth } from '@/contexts/AuthContext';
import { OpenRouterSettings } from '@/components/settings/api/OpenRouterSettings';

interface ModelIndicatorProps {
  onModelChange?: (model: string) => void;
  className?: string;
}

const AVAILABLE_MODELS = [
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
  { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', provider: 'Mistral' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'LLaMA 3 70B', provider: 'Meta' }
];

export const ModelIndicator: React.FC<ModelIndicatorProps> = ({ 
  onModelChange, 
  className = '' 
}) => {
  const { user } = useAuth();
  const { getCurrentModel } = useOpenRouter();
  const [currentModel, setCurrentModel] = useState<string>('openai/gpt-4o-mini');
  const [isLoading, setIsLoading] = useState(true);
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

  const handleModelChange = () => {
    // Reload current model when dialog closes
    loadCurrentModel();
    onModelChange?.(currentModel);
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
      
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          handleModelChange();
        }
      }}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs font-medium bg-neon-purple/10 hover:bg-neon-purple/20 border border-neon-purple/20"
          >
            {modelInfo.name}
            <Settings className="h-3 w-3 ml-1" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>OpenRouter Settings</DialogTitle>
          </DialogHeader>
          <OpenRouterSettings />
        </DialogContent>
      </Dialog>
    </div>
  );
};