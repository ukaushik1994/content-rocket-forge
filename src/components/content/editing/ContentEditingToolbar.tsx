import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Wand2, 
  Expand, 
  Shrink, 
  RefreshCw, 
  Sparkles, 
  Pencil,
  Target,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentEditingToolbarProps {
  onRegenerate?: () => void;
  onExpand?: () => void;
  onCompress?: () => void;
  onImprove?: () => void;
  onChangeTone?: (tone: string) => void;
  isProcessing?: boolean;
  className?: string;
}

const toneOptions = [
  { id: 'professional', label: 'Professional', icon: Target },
  { id: 'conversational', label: 'Conversational', icon: MessageSquare },
  { id: 'persuasive', label: 'Persuasive', icon: Sparkles },
];

export const ContentEditingToolbar: React.FC<ContentEditingToolbarProps> = ({
  onRegenerate,
  onExpand,
  onCompress,
  onImprove,
  onChangeTone,
  isProcessing = false,
  className
}) => {
  return (
    <TooltipProvider>
      <div className={cn(
        "flex items-center gap-1 p-1.5 rounded-lg",
        "bg-card/80 backdrop-blur-sm border border-border/50",
        "shadow-sm",
        className
      )}>
        {/* Regenerate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              disabled={isProcessing}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <RefreshCw className={cn("h-4 w-4", isProcessing && "animate-spin")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Regenerate content</TooltipContent>
        </Tooltip>

        {/* AI Improve */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onImprove}
              disabled={isProcessing}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI Improve</TooltipContent>
        </Tooltip>

        <div className="w-px h-5 bg-border/50 mx-0.5" />

        {/* Expand */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpand}
              disabled={isProcessing}
              className="h-8 w-8 p-0 hover:bg-emerald-500/10 hover:text-emerald-500"
            >
              <Expand className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Expand content</TooltipContent>
        </Tooltip>

        {/* Compress */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCompress}
              disabled={isProcessing}
              className="h-8 w-8 p-0 hover:bg-amber-500/10 hover:text-amber-500"
            >
              <Shrink className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Compress content</TooltipContent>
        </Tooltip>

        <div className="w-px h-5 bg-border/50 mx-0.5" />

        {/* Tone buttons */}
        {toneOptions.map(tone => (
          <Tooltip key={tone.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChangeTone?.(tone.id)}
                disabled={isProcessing}
                className="h-8 px-2 text-xs hover:bg-secondary/50"
              >
                <tone.icon className="h-3.5 w-3.5 mr-1" />
                {tone.label}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Change tone to {tone.label.toLowerCase()}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
